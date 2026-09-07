/**
 * Authorization Tests — CRIT-05, HIGH-01, HIGH-02
 *
 * Tests payment ownership, amount tampering, seller product ownership,
 * refund and shipment ownership without any real DB or Stripe connection.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');

// ─────────────────────────────────────────────
// Mock helpers
// ─────────────────────────────────────────────

const makeId = () => new mongoose.Types.ObjectId();

function makeRes() {
  const res = { statusCode: null, body: null };
  res.status = (s) => { res.statusCode = s; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
}

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    failed++;
  }
}

// ─────────────────────────────────────────────
// Load middleware + controllers
// ─────────────────────────────────────────────

const { protect, seller, admin, sellerOrAdmin } = require('./middleware/authMiddleware');
const paymentController = require('./controllers/paymentController');
const shipmentController = require('./controllers/shipmentController');
const productController = require('./controllers/productController');
const orderController = require('./controllers/orderController');
const Order = require('./models/Order');
const Payment = require('./models/Payment');
const Product = require('./models/Product');
const Notification = require('./models/Notification');
const Shipment = require('./models/Shipment');

// Stub Notification and Shipment to avoid unhandled DB buffering in unit tests
Notification.create = async () => ({});
Shipment.findOne = async () => ({
  status: 'Pending',
  timeline: [],
  save: async () => {}
});
Shipment.prototype.save = async () => {};

// ─────────────────────────────────────────────
// Helper: build a mock mongoose object with a
// chained .populate() that resolves to itself
// ─────────────────────────────────────────────

function makeMockOrderDoc(overrides) {
  const doc = {
    _id: overrides._id || makeId(),
    customer: overrides.customer,
    totalAmount: overrides.totalAmount ?? 1500,
    paymentStatus: overrides.paymentStatus || 'pending',
    orderStatus: 'Pending',
    products: overrides.products || [],
    trackingNumber: '',
    timeline: [],
    save: async () => {},
  };
  // .populate() chain support
  doc.populate = function() { return Promise.resolve(doc); };
  return doc;
}

// ─────────────────────────────────────────────
// Main test runner
// ─────────────────────────────────────────────

async function runTests() {

  // ───────────────────────────────────────────
  // Section 1 — authMiddleware sellerOrAdmin
  // ───────────────────────────────────────────
  console.log('\n🔐 1. AuthMiddleware — sellerOrAdmin');

  function testMw(user, expectNext) {
    const res = makeRes();
    let nextCalled = false;
    sellerOrAdmin({ user }, res, () => { nextCalled = true; });
    return { nextCalled, res };
  }

  let r;
  r = testMw({ role: 'admin', status: 'approved' }, true);
  assert(r.nextCalled, 'Admin passes sellerOrAdmin');

  r = testMw({ role: 'seller', status: 'approved' }, true);
  assert(r.nextCalled, 'Approved seller passes sellerOrAdmin');

  r = testMw({ role: 'seller', status: 'suspended' }, false);
  assert(!r.nextCalled && r.res.statusCode === 403, 'Suspended seller rejected with 403');

  r = testMw({ role: 'customer', status: 'approved' }, false);
  assert(!r.nextCalled && r.res.statusCode === 403, 'Customer rejected with 403 by sellerOrAdmin');

  r = testMw(null, false);
  assert(!r.nextCalled && r.res.statusCode === 401, 'Null user rejected with 401');

  // ───────────────────────────────────────────
  // Section 2 — Payment ownership & amount tampering
  // ───────────────────────────────────────────
  console.log('\n💳 2. Payment — Ownership & Amount Tampering');

  const customerAId = makeId();
  const customerBId = makeId();

  // Test 2a: Customer B cannot pay Customer A's order → 403
  {
    const order = makeMockOrderDoc({ customer: customerAId, totalAmount: 1500 });
    const origFindById = Order.findById.bind(Order);
    Order.findById = () => { const d = { ...order }; d.populate = () => Promise.resolve(d); return d; };

    const req = { body: { orderId: order._id.toString(), paymentMethod: 'UPI' }, user: { _id: customerBId, role: 'customer' } };
    const res = makeRes();
    await paymentController.createPayment(req, res);
    assert(res.statusCode === 403, 'Customer cannot pay another customer\'s order → 403');
    Order.findById = origFindById;
  }

  // Test 2b: Client-provided amount is ignored — server uses order.totalAmount
  {
    const order = makeMockOrderDoc({ customer: customerAId, totalAmount: 2500 });
    let storedAmount = null;
    const origFindById = Order.findById.bind(Order);
    const origCreate = Payment.create.bind(Payment);
    Order.findById = () => { const d = { ...order, products: [] }; d.save = async () => {}; d.populate = () => Promise.resolve(d); d.timeline = []; return d; };
    Payment.create = async (data) => { storedAmount = data.amount; return data; };

    const req = { body: { orderId: order._id.toString(), paymentMethod: 'UPI', amount: 99999 }, user: { _id: customerAId, role: 'customer' } };
    const res = makeRes();
    await paymentController.createPayment(req, res);

    assert(storedAmount === 2500, 'Server-authoritative amount (2500) used, not client-supplied (99999)');
    assert(storedAmount !== 99999, 'Client-supplied amount 99999 was NOT stored');
    Order.findById = origFindById;
    Payment.create = origCreate;
  }

  // Test 2c: Already-paid order rejected
  {
    const order = makeMockOrderDoc({ customer: customerAId, totalAmount: 1000, paymentStatus: 'completed' });
    const origFindById = Order.findById.bind(Order);
    Order.findById = () => { const d = { ...order }; d.populate = () => Promise.resolve(d); return d; };

    const req = { body: { orderId: order._id.toString(), paymentMethod: 'UPI' }, user: { _id: customerAId, role: 'customer' } };
    const res = makeRes();
    await paymentController.createPayment(req, res);
    assert(res.statusCode === 400 && res.body.message.includes('already been paid'), 'Double-payment rejected → 400');
    Order.findById = origFindById;
  }

  // Test 2d: Non-existent order returns 404
  {
    const origFindById = Order.findById.bind(Order);
    Order.findById = () => { return { populate: () => Promise.resolve(null) }; };

    const req = { body: { orderId: makeId().toString(), paymentMethod: 'UPI' }, user: { _id: customerAId, role: 'customer' } };
    const res = makeRes();
    await paymentController.createPayment(req, res);
    assert(res.statusCode === 404, 'Non-existent order returns 404');
    Order.findById = origFindById;
  }

  // Test 2e: Missing orderId returns 400
  {
    const req = { body: { paymentMethod: 'UPI' }, user: { _id: customerAId, role: 'customer' } };
    const res = makeRes();
    await paymentController.createPayment(req, res);
    assert(res.statusCode === 400, 'Missing orderId returns 400');
  }

  // ───────────────────────────────────────────
  // Section 3 — Refund Seller Ownership
  // ───────────────────────────────────────────
  console.log('\n🔄 3. Refund — Seller Ownership Check');

  const sellerAId = makeId();
  const sellerBId = makeId();
  const productByA = { _id: makeId(), seller: sellerAId };
  const productByB = { _id: makeId(), seller: sellerBId };
  const fakePaymentDoc = { _id: makeId(), order: makeId(), amount: 1500, paymentStatus: 'completed', refundReason: '', save: async () => {} };

  // Test 3a: Seller B tries to refund an order with only Seller A's products → 403
  {
    const order = {
      _id: makeId(), customer: makeId(), products: [{ product: productByA }],
      orderStatus: 'Confirmed', paymentStatus: 'completed', timeline: [], save: async () => {},
    };
    const origPaymentFind = Payment.findById.bind(Payment);
    const origOrderFind = Order.findById.bind(Order);
    Payment.findById = async () => fakePaymentDoc;
    Order.findById = () => ({ ...order, populate: () => Promise.resolve({ ...order }) });

    const req = { body: { paymentId: fakePaymentDoc._id.toString() }, user: { _id: sellerBId, role: 'seller' } };
    const res = makeRes();
    await paymentController.refundPayment(req, res);
    assert(res.statusCode === 403, 'Seller B cannot refund Seller A\'s order → 403');
    Payment.findById = origPaymentFind;
    Order.findById = origOrderFind;
  }

  // Test 3b: Customer tries to refund → 403
  {
    const origPaymentFind = Payment.findById.bind(Payment);
    Payment.findById = async () => fakePaymentDoc;

    const req = { body: { paymentId: fakePaymentDoc._id.toString() }, user: { _id: makeId(), role: 'customer' } };
    const res = makeRes();
    await paymentController.refundPayment(req, res);
    assert(res.statusCode === 403, 'Customer cannot issue refund → 403');
    Payment.findById = origPaymentFind;
  }

  // Test 3c: Seller A refunds order containing Seller A's product → passes ownership check
  {
    const order = {
      _id: makeId(), customer: makeId(), products: [{ product: productByA }],
      orderStatus: 'Confirmed', paymentStatus: 'completed', timeline: [], save: async () => {},
    };
    const origPaymentFind = Payment.findById.bind(Payment);
    const origOrderFind = Order.findById.bind(Order);
    Payment.findById = async () => ({ ...fakePaymentDoc, save: async () => {} });
    Order.findById = () => ({ ...order, populate: () => Promise.resolve({ ...order }) });

    const req = { body: { paymentId: fakePaymentDoc._id.toString() }, user: { _id: sellerAId, role: 'seller' } };
    const res = makeRes();
    await paymentController.refundPayment(req, res);
    assert(res.statusCode !== 403, 'Seller A CAN refund their own order → no 403');
    Payment.findById = origPaymentFind;
    Order.findById = origOrderFind;
  }

  // ───────────────────────────────────────────
  // Section 4 — Shipment Ownership
  // ───────────────────────────────────────────
  console.log('\n🚚 4. Shipment — Seller Ownership Check');

  // Test 4a: Seller B tries to update Seller A's shipment → 403
  {
    const order = {
      _id: makeId(), customer: makeId(),
      products: [{ product: productByA }],
      orderStatus: 'Processing', shipmentStatus: 'Processing', trackingNumber: '', timeline: [], save: async () => {},
    };
    const origOrderFind = Order.findById.bind(Order);
    Order.findById = () => ({ ...order, populate: () => Promise.resolve({ ...order }) });

    const req = { params: { id: order._id.toString() }, body: { status: 'Shipped' }, user: { _id: sellerBId, role: 'seller', status: 'approved' } };
    const res = makeRes();
    await shipmentController.updateShipment(req, res);
    assert(res.statusCode === 403, 'Seller B cannot update Seller A\'s shipment → 403');
    Order.findById = origOrderFind;
  }

  // Test 4b: Customer tries to update shipment → 403
  {
    const req = { params: { id: makeId().toString() }, body: { status: 'Shipped' }, user: { _id: makeId(), role: 'customer', status: 'approved' } };
    const res = makeRes();
    await shipmentController.updateShipment(req, res);
    assert(res.statusCode === 403, 'Customer cannot update shipment → 403');
  }

  // Test 4c: Suspended seller cannot update shipment → 403
  {
    const order = {
      _id: makeId(), customer: makeId(),
      products: [{ product: productByA }],
      orderStatus: 'Processing', shipmentStatus: 'Processing', trackingNumber: '', timeline: [], save: async () => {},
    };
    const origOrderFind = Order.findById.bind(Order);
    Order.findById = () => ({ ...order, populate: () => Promise.resolve({ ...order }) });

    const req = { params: { id: order._id.toString() }, body: { status: 'Shipped' }, user: { _id: sellerAId, role: 'seller', status: 'suspended' } };
    const res = makeRes();
    await shipmentController.updateShipment(req, res);
    assert(res.statusCode === 403, 'Suspended seller blocked from updating shipment → 403');
    Order.findById = origOrderFind;
  }

  // Test 4d: Seller A updates shipment for their own order → passes ownership check
  {
    const order = {
      _id: makeId(), customer: makeId(),
      products: [{ product: productByA }],
      orderStatus: 'Processing', shipmentStatus: 'Processing', trackingNumber: '', timeline: [], save: async () => {},
    };
    const origOrderFind = Order.findById.bind(Order);
    Order.findById = () => ({ ...order, populate: () => Promise.resolve({ ...order }) });

    const req = { params: { id: order._id.toString() }, body: { status: 'Shipped' }, user: { _id: sellerAId, role: 'seller', status: 'approved' } };
    const res = makeRes();
    await shipmentController.updateShipment(req, res);
    assert(res.statusCode !== 403, 'Seller A CAN update their own shipment → no 403');
    Order.findById = origOrderFind;
  }

  // ───────────────────────────────────────────
  // Section 5 — Product Controller Ownership
  // ───────────────────────────────────────────
  console.log('\n📦 5. Product — Controller Ownership (updateProduct / deleteProduct)');

  function makeProductDoc(sellerId) {
    return { _id: makeId(), seller: sellerId, title: 'Test', images: [], imageUrl: '', deleteOne: async () => {} };
  }

  // Test 5a: Seller A deletes Seller B's product → 403
  {
    const prod = makeProductDoc(sellerBId);
    const origFind = Product.findById.bind(Product);
    Product.findById = async () => prod;
    const req = { params: { id: prod._id.toString() }, user: { _id: sellerAId, role: 'seller' } };
    const res = makeRes();
    await productController.deleteProduct(req, res);
    assert(res.statusCode === 403, 'Seller A cannot delete Seller B\'s product → 403');
    Product.findById = origFind;
  }

  // Test 5b: Seller A deletes own product → not 403
  {
    const prod = makeProductDoc(sellerAId);
    const origFind = Product.findById.bind(Product);
    Product.findById = async () => prod;
    const req = { params: { id: prod._id.toString() }, user: { _id: sellerAId, role: 'seller' } };
    const res = makeRes();
    await productController.deleteProduct(req, res);
    assert(res.statusCode !== 403, 'Seller A can delete own product → no 403');
    Product.findById = origFind;
  }

  // Test 5c: Admin deletes any product → not 403
  {
    const prod = makeProductDoc(sellerBId);
    const origFind = Product.findById.bind(Product);
    Product.findById = async () => prod;
    const req = { params: { id: prod._id.toString() }, user: { _id: makeId(), role: 'admin' } };
    const res = makeRes();
    await productController.deleteProduct(req, res);
    assert(res.statusCode !== 403, 'Admin can delete any product → no 403');
    Product.findById = origFind;
  }

  // Test 5d: Seller A updates Seller B's product → 403
  {
    const prod = makeProductDoc(sellerBId);
    const origFind = Product.findById.bind(Product);
    Product.findById = async () => prod;
    const req = { params: { id: prod._id.toString() }, body: {}, user: { _id: sellerAId, role: 'seller' }, files: null, file: null };
    const res = makeRes();
    await productController.updateProduct(req, res);
    assert(res.statusCode === 403, 'Seller A cannot update Seller B\'s product → 403');
    Product.findById = origFind;
  }

  // Test 5e: Seller A updates own product → not 403
  {
    const prod = makeProductDoc(sellerAId);
    const origFind = Product.findById.bind(Product);
    Product.findById = async () => prod;
    const req = { params: { id: prod._id.toString() }, body: { title: 'Updated' }, user: { _id: sellerAId, role: 'seller' }, files: null, file: null };
    const res = makeRes();
    await productController.updateProduct(req, res);
    assert(res.statusCode !== 403, 'Seller A can update own product → no 403');
    Product.findById = origFind;
  }

  // ───────────────────────────────────────────
  // Section 6 — Route-level gate (sellerOrAdmin)
  // ───────────────────────────────────────────
  console.log('\n🛣️  6. Route Gate — sellerOrAdmin Middleware');

  {
    const res = makeRes();
    let nextCalled = false;
    sellerOrAdmin({ user: { role: 'customer', status: 'approved' } }, res, () => { nextCalled = true; });
    assert(!nextCalled && res.statusCode === 403, 'Customer blocked at route level (PUT/DELETE products)');
  }

  {
    const res = makeRes();
    let nextCalled = false;
    sellerOrAdmin({ user: { role: 'seller', status: 'approved' } }, res, () => { nextCalled = true; });
    assert(nextCalled, 'Approved seller passes route gate');
  }

  {
    const res = makeRes();
    let nextCalled = false;
    sellerOrAdmin({ user: { role: 'admin' } }, res, () => { nextCalled = true; });
    assert(nextCalled, 'Admin passes route gate');
  }

  // ───────────────────────────────────────────
  // Section 7 — Order Status (updateOrderStatus)
  // ───────────────────────────────────────────
  console.log('\n📦 7. Order Status — Resource Ownership & Authorization (updateOrderStatus)');

  const orderSellerAId = makeId();
  const orderSellerBId = makeId();
  const prodOwnedByA = { _id: makeId(), seller: orderSellerAId };
  const prodOwnedByB = { _id: makeId(), seller: orderSellerBId };

  function makeOrderForStatus(products) {
    return {
      _id: makeId(),
      customer: makeId(),
      products,
      orderStatus: 'Processing',
      shipmentStatus: 'Processing',
      trackingNumber: 'TRK_TEST',
      timeline: [],
      save: async () => {},
    };
  }

  // Test 7a: Seller A updates an order containing Seller A's product → allowed
  {
    const order = makeOrderForStatus([{ product: prodOwnedByA }]);
    const origOrderFind = Order.findById.bind(Order);
    Order.findById = () => ({ ...order, populate: () => Promise.resolve({ ...order }) });

    const req = {
      params: { id: order._id.toString() },
      body: { status: 'Packed' },
      user: { _id: orderSellerAId, role: 'seller', status: 'approved' }
    };
    const res = makeRes();
    await orderController.updateOrderStatus(req, res);
    assert(res.statusCode !== 403 && res.statusCode !== 401, '1. Seller A updates order with Seller A\'s product → allowed');
    Order.findById = origOrderFind;
  }

  // Test 7b: Seller A updates an order containing only Seller B's products → 403
  {
    const order = makeOrderForStatus([{ product: prodOwnedByB }]);
    const origOrderFind = Order.findById.bind(Order);
    Order.findById = () => ({ ...order, populate: () => Promise.resolve({ ...order }) });

    const req = {
      params: { id: order._id.toString() },
      body: { status: 'Packed' },
      user: { _id: orderSellerAId, role: 'seller', status: 'approved' }
    };
    const res = makeRes();
    await orderController.updateOrderStatus(req, res);
    assert(res.statusCode === 403, '2. Seller A updates order containing only Seller B\'s products → 403');
    Order.findById = origOrderFind;
  }

  // Test 7c: Seller A updates an order containing products from Seller A and Seller B → allowed under current multi-seller rule
  {
    const order = makeOrderForStatus([{ product: prodOwnedByA }, { product: prodOwnedByB }]);
    const origOrderFind = Order.findById.bind(Order);
    Order.findById = () => ({ ...order, populate: () => Promise.resolve({ ...order }) });

    const req = {
      params: { id: order._id.toString() },
      body: { status: 'Shipped' },
      user: { _id: orderSellerAId, role: 'seller', status: 'approved' }
    };
    const res = makeRes();
    await orderController.updateOrderStatus(req, res);
    assert(res.statusCode !== 403 && res.statusCode !== 401, '3. Seller A updates multi-seller order (Seller A + B) → allowed under current rule');
    Order.findById = origOrderFind;
  }

  // Test 7d: Customer attempts update → 403 (at controller level and route level)
  {
    const order = makeOrderForStatus([{ product: prodOwnedByA }]);
    const origOrderFind = Order.findById.bind(Order);
    Order.findById = () => ({ ...order, populate: () => Promise.resolve({ ...order }) });

    const req = {
      params: { id: order._id.toString() },
      body: { status: 'Delivered' },
      user: { _id: makeId(), role: 'customer', status: 'approved' }
    };
    const res = makeRes();
    await orderController.updateOrderStatus(req, res);
    assert(res.statusCode === 403, '4a. Customer attempts update at controller level → 403');

    // Also verify route level rejection for customer
    const routeRes = makeRes();
    let routeNext = false;
    sellerOrAdmin(req, routeRes, () => { routeNext = true; });
    assert(!routeNext && routeRes.statusCode === 403, '4b. Customer blocked at route level via sellerOrAdmin → 403');

    Order.findById = origOrderFind;
  }

  // Test 7e: Admin attempts update → allowed (retains existing intended admin permissions)
  {
    const order = makeOrderForStatus([{ product: prodOwnedByB }]);
    const origOrderFind = Order.findById.bind(Order);
    Order.findById = () => ({ ...order, populate: () => Promise.resolve({ ...order }) });

    const req = {
      params: { id: order._id.toString() },
      body: { status: 'Delivered' },
      user: { _id: makeId(), role: 'admin' }
    };
    const res = makeRes();
    await orderController.updateOrderStatus(req, res);
    assert(res.statusCode !== 403 && res.statusCode !== 401, '5. Admin updates any order → allowed (intact admin permissions)');
    Order.findById = origOrderFind;
  }

  // Test 7f: Unauthenticated request → 401 (via protect middleware)
  {
    const req = { headers: {} };
    const res = makeRes();
    let nextCalled = false;
    await protect(req, res, () => { nextCalled = true; });
    assert(!nextCalled && res.statusCode === 401, '6. Unauthenticated request without token → 401');
  }

  // Test 7g: Suspended seller attempts update → 403
  {
    const order = makeOrderForStatus([{ product: prodOwnedByA }]);
    const origOrderFind = Order.findById.bind(Order);
    Order.findById = () => ({ ...order, populate: () => Promise.resolve({ ...order }) });

    const req = {
      params: { id: order._id.toString() },
      body: { status: 'Packed' },
      user: { _id: orderSellerAId, role: 'seller', status: 'suspended' }
    };
    const res = makeRes();
    await orderController.updateOrderStatus(req, res);
    assert(res.statusCode === 403, '7. Suspended seller blocked from updating order status → 403');
    Order.findById = origOrderFind;
  }

  // ───────────────────────────────────────────
  // Summary
  // ───────────────────────────────────────────
  console.log('\n=============================================================');
  console.log(`AUTHORIZATION TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('=============================================================\n');
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal error in test runner:', err);
  process.exit(1);
});
