/**
 * Test Suite: Server-Authoritative Pricing & Order Creation (CRIT-01)
 *
 * Tests:
 * 1. Pricing helper unit tests (exact boundary: 999, 1000, 1001, GST rounding, multi-product)
 * 2. Price tampering: client attempts totalAmount: 1, price: 1 -> ignored, DB price used
 * 3. Quantity tampering: negative, zero, decimal, non-numeric, stock-exceeding -> 400
 * 4. Product tampering: nonexistent (404), inactive/flagged (400), malformed ID (400)
 * 5. Duplicate product ID consolidation before stock check & pricing
 * 6. Empty order rejection -> 400
 * 7. Payment integration regression: createPayment reads server-authoritative Order.totalAmount
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const { calculateOrderPricing } = require('./utils/pricing');
const orderController = require('./controllers/orderController');
const paymentController = require('./controllers/paymentController');
const Order = require('./models/Order');
const Product = require('./models/Product');
const Notification = require('./models/Notification');
const Shipment = require('./models/Shipment');
const Payment = require('./models/Payment');

// Mock helpers
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

// Stub background Mongoose operations that require a live MongoDB connection
Notification.create = async () => ({});
Shipment.create = async () => ({});
Shipment.findOne = async () => ({ status: 'Pending', timeline: [], save: async () => {} });
Shipment.prototype.save = async () => {};

async function runPricingTests() {
  console.log('\n=============================================================');
  console.log('STEP 5 — SERVER-AUTHORITATIVE PRICING TEST SUITE');
  console.log('=============================================================');

  // ───────────────────────────────────────────
  // 1. Centralized Pricing Helper Unit Tests
  // ───────────────────────────────────────────
  console.log('\n📐 1. Centralized Pricing Helper Unit Tests (pricing.js)');

  // Boundary: Subtotal = 999
  {
    const prod999 = { _id: makeId(), price: 999 };
    const r = calculateOrderPricing([{ productDoc: prod999, quantity: 1 }]);
    assert(r.subtotal === 999, 'Subtotal is 999');
    assert(r.shippingFee === 99, 'Shipping fee for 999 is 99 (subtotal <= 1000)');
    assert(r.gst === Math.round(999 * 0.05), 'GST is Math.round(999 * 0.05) = 50');
    assert(r.totalAmount === 999 + 50 + 99, `Grand total for 999 is 1148 (actual: ${r.totalAmount})`);
  }

  // Exact Boundary: Subtotal = 1000 (MUST be 99 shipping, preserving > 1000 strictly)
  {
    const prod1000 = { _id: makeId(), price: 1000 };
    const r = calculateOrderPricing([{ productDoc: prod1000, quantity: 1 }]);
    assert(r.subtotal === 1000, 'Subtotal is 1000');
    assert(r.shippingFee === 99, 'Shipping fee for EXACTLY 1000 is 99 (subtotal > 1000 required for free shipping)');
    assert(r.gst === 50, 'GST for 1000 is 50');
    assert(r.totalAmount === 1000 + 50 + 99, `Grand total for 1000 is 1149 (actual: ${r.totalAmount})`);
  }

  // Exact Boundary: Subtotal = 1001 (FREE shipping)
  {
    const prod1001 = { _id: makeId(), price: 1001 };
    const r = calculateOrderPricing([{ productDoc: prod1001, quantity: 1 }]);
    assert(r.subtotal === 1001, 'Subtotal is 1001');
    assert(r.shippingFee === 0, 'Shipping fee for 1001 is 0 (FREE shipping over 1000)');
    assert(r.gst === 50, 'GST for 1001 is 50 (Math.round(50.05) = 50)');
    assert(r.totalAmount === 1001 + 50 + 0, `Grand total for 1001 is 1051 (actual: ${r.totalAmount})`);
  }

  // GST Rounding tests
  {
    // 15 * 0.05 = 0.75 -> rounds to 1
    const p15 = { _id: makeId(), price: 15 };
    const r15 = calculateOrderPricing([{ productDoc: p15, quantity: 1 }]);
    assert(r15.gst === 1, 'GST for subtotal 15 is 1 (Math.round(0.75) = 1)');

    // 70 * 0.05 = 3.5 -> Math.round in JS rounds 3.5 to 4
    const p70 = { _id: makeId(), price: 70 };
    const r70 = calculateOrderPricing([{ productDoc: p70, quantity: 1 }]);
    assert(r70.gst === 4, 'GST for subtotal 70 is 4 (Math.round(3.5) = 4)');
  }

  // Multiple products and quantities
  {
    const pA = { _id: makeId(), price: 250 };
    const pB = { _id: makeId(), price: 400 };
    const r = calculateOrderPricing([
      { productDoc: pA, quantity: 2 }, // 500
      { productDoc: pB, quantity: 3 }, // 1200
    ]);
    assert(r.subtotal === 1700, 'Subtotal for multiple products: 2*250 + 3*400 = 1700');
    assert(r.shippingFee === 0, 'Shipping fee for 1700 is 0 (> 1000)');
    assert(r.gst === 85, 'GST for 1700 is 85 (1700 * 0.05)');
    assert(r.totalAmount === 1785, 'Grand total is 1700 + 85 + 0 = 1785');
    assert(r.orderItems.length === 2, 'orderItems contains 2 entries');
    assert(r.orderItems[0].price === 250, 'orderItem A price is 250');
    assert(r.orderItems[1].price === 400, 'orderItem B price is 400');
  }

  // Large valid numbers
  {
    const pLarge = { _id: makeId(), price: 50000 };
    const r = calculateOrderPricing([{ productDoc: pLarge, quantity: 10 }]);
    assert(r.subtotal === 500000, 'Large subtotal: 500,000');
    assert(r.gst === 25000, 'Large GST: 25,000');
    assert(r.shippingFee === 0, 'Large shipping: 0');
    assert(r.totalAmount === 525000, 'Large totalAmount: 525,000');
  }

  // ───────────────────────────────────────────
  // 2. Price Tampering Prevention in createOrder
  // ───────────────────────────────────────────
  console.log('\n🛡️  2. Price Tampering Prevention (createOrder)');

  const customerId = makeId();
  const sellerId = makeId();

  // Test 2a: Client sends forged totalAmount = 1, price = 1 -> Server calculates authoritative ₹2,520
  {
    const realProd = {
      _id: makeId(),
      title: 'Silk Saree',
      price: 1200, // authoritative DB price
      stockQuantity: 10,
      stockStatus: 'In Stock',
      status: 'active',
      seller: sellerId,
      save: async () => {}
    };

    const origFindById = Product.findById.bind(Product);
    Product.findById = async () => realProd;

    let createdOrderDoc = null;
    const origOrderCreate = Order.create.bind(Order);
    Order.create = async (doc) => { createdOrderDoc = doc; return { ...doc, _id: makeId() }; };

    const req = {
      body: {
        products: [
          {
            product: realProd._id.toString(),
            quantity: 2,
            price: 1 // Malicious: client claims price is 1
          }
        ],
        subtotal: 2,         // Malicious
        gst: 0,              // Malicious
        shippingFee: 0,      // Malicious
        totalAmount: 1,      // Malicious: client claims grand total is 1
        shippingAddress: '123 Test St'
      },
      user: { _id: customerId, role: 'customer' }
    };

    const res = makeRes();
    await orderController.createOrder(req, res);

    assert(res.statusCode === 201, 'Order created successfully (201)');
    assert(createdOrderDoc !== null, 'Order document created');
    // Expected: subtotal = 1200 * 2 = 2400, gst = 120, shippingFee = 0 (> 1000), totalAmount = 2520
    assert(createdOrderDoc.subtotal === 2400, `Authoritative subtotal is 2400 (actual: ${createdOrderDoc.subtotal})`);
    assert(createdOrderDoc.gst === 120, `Authoritative GST is 120 (actual: ${createdOrderDoc.gst})`);
    assert(createdOrderDoc.shippingFee === 0, `Authoritative shippingFee is 0 (actual: ${createdOrderDoc.shippingFee})`);
    assert(createdOrderDoc.totalAmount === 2520, `Authoritative totalAmount is 2520 (actual: ${createdOrderDoc.totalAmount})`);
    assert(createdOrderDoc.totalAmount !== 1, 'Client forged totalAmount (1) was COMPLETELY IGNORED');
    assert(createdOrderDoc.products[0].price === 1200, 'Persisted line item price is 1200 from DB, not 1 from client');

    Product.findById = origFindById;
    Order.create = origOrderCreate;
  }

  // ───────────────────────────────────────────
  // 3. Quantity Tampering Prevention
  // ───────────────────────────────────────────
  console.log('\n🔢 3. Quantity Tampering Prevention (createOrder)');

  const validProdId = makeId().toString();

  // Test 3a: Negative quantity -> 400
  {
    const req = {
      body: { products: [{ product: validProdId, quantity: -5 }] },
      user: { _id: customerId }
    };
    const res = makeRes();
    await orderController.createOrder(req, res);
    assert(res.statusCode === 400 && res.body.message.includes('positive whole integer'), 'Negative quantity rejected with 400');
  }

  // Test 3b: Zero quantity -> 400
  {
    const req = {
      body: { products: [{ product: validProdId, quantity: 0 }] },
      user: { _id: customerId }
    };
    const res = makeRes();
    await orderController.createOrder(req, res);
    assert(res.statusCode === 400 && res.body.message.includes('positive whole integer'), 'Zero quantity rejected with 400');
  }

  // Test 3c: Decimal quantity -> 400
  {
    const req = {
      body: { products: [{ product: validProdId, quantity: 2.5 }] },
      user: { _id: customerId }
    };
    const res = makeRes();
    await orderController.createOrder(req, res);
    assert(res.statusCode === 400 && res.body.message.includes('positive whole integer'), 'Decimal quantity rejected with 400');
  }

  // Test 3d: Non-numeric quantity string -> 400
  {
    const req = {
      body: { products: [{ product: validProdId, quantity: 'two' }] },
      user: { _id: customerId }
    };
    const res = makeRes();
    await orderController.createOrder(req, res);
    assert(res.statusCode === 400 && res.body.message.includes('positive whole integer'), 'Non-numeric string quantity rejected with 400');
  }

  // Test 3e: Quantity exceeding stock -> 400
  {
    const limitedProd = {
      _id: makeId(),
      title: 'Handmade Candle',
      price: 300,
      stockQuantity: 2, // only 2 available
      status: 'active',
      seller: sellerId,
      save: async () => {}
    };

    const origFind = Product.findById.bind(Product);
    Product.findById = async () => limitedProd;

    const req = {
      body: { products: [{ product: limitedProd._id.toString(), quantity: 10 }] },
      user: { _id: customerId }
    };
    const res = makeRes();
    await orderController.createOrder(req, res);
    assert(res.statusCode === 400 && res.body.message.includes('Insufficient stock'), 'Quantity exceeding stock rejected with 400');

    Product.findById = origFind;
  }

  // ───────────────────────────────────────────
  // 4. Product Tampering Prevention
  // ───────────────────────────────────────────
  console.log('\n🚫 4. Product Tampering Prevention (createOrder)');

  // Test 4a: Empty order -> 400
  {
    const req = {
      body: { products: [] },
      user: { _id: customerId }
    };
    const res = makeRes();
    await orderController.createOrder(req, res);
    assert(res.statusCode === 400 && res.body.message.includes('at least one product'), 'Empty products array rejected with 400');
  }

  // Test 4b: Malformed product ID -> 400
  {
    const req = {
      body: { products: [{ product: 'not-a-valid-id', quantity: 1 }] },
      user: { _id: customerId }
    };
    const res = makeRes();
    await orderController.createOrder(req, res);
    assert(res.statusCode === 400 && res.body.message.includes('Invalid product ID format'), 'Malformed product ID rejected with 400');
  }

  // Test 4c: Missing product ID in item -> 400
  {
    const req = {
      body: { products: [{ quantity: 1 }] },
      user: { _id: customerId }
    };
    const res = makeRes();
    await orderController.createOrder(req, res);
    assert(res.statusCode === 400 && res.body.message.includes('Product ID is required'), 'Missing product ID rejected with 400');
  }

  // Test 4d: Nonexistent product ID in DB -> 404
  {
    const origFind = Product.findById.bind(Product);
    Product.findById = async () => null; // not in DB

    const req = {
      body: { products: [{ product: makeId().toString(), quantity: 1 }] },
      user: { _id: customerId }
    };
    const res = makeRes();
    await orderController.createOrder(req, res);
    assert(res.statusCode === 404 && res.body.message.includes('not found'), 'Nonexistent product returns 404');

    Product.findById = origFind;
  }

  // Test 4e: Inactive / Flagged product -> 400
  {
    const flaggedProd = {
      _id: makeId(),
      title: 'Flagged Herbal Oil',
      price: 500,
      stockQuantity: 10,
      status: 'flagged', // flagged product
      seller: sellerId,
      save: async () => {}
    };

    const origFind = Product.findById.bind(Product);
    Product.findById = async () => flaggedProd;

    const req = {
      body: { products: [{ product: flaggedProd._id.toString(), quantity: 1 }] },
      user: { _id: customerId }
    };
    const res = makeRes();
    await orderController.createOrder(req, res);
    assert(res.statusCode === 400 && res.body.message.includes('unavailable'), 'Inactive/flagged product rejected with 400');

    Product.findById = origFind;
  }

  // ───────────────────────────────────────────
  // 5. Duplicate Product ID Consolidation
  // ───────────────────────────────────────────
  console.log('\n🔄 5. Duplicate Product ID Consolidation (createOrder)');

  // Test 5a: Client sends A x 1 and A x 2 -> Consolidated to A x 3 before stock check & calculation
  {
    const dupProd = {
      _id: makeId(),
      title: 'Embroidered Cushion',
      price: 400,
      stockQuantity: 5,
      status: 'active',
      seller: sellerId,
      save: async () => {}
    };

    const origFind = Product.findById.bind(Product);
    Product.findById = async () => dupProd;

    let createdDoc = null;
    const origCreate = Order.create.bind(Order);
    Order.create = async (doc) => { createdDoc = doc; return { ...doc, _id: makeId() }; };

    const req = {
      body: {
        products: [
          { product: dupProd._id.toString(), quantity: 1 },
          { product: dupProd._id.toString(), quantity: 2 }
        ],
        shippingAddress: '456 Art Lane'
      },
      user: { _id: customerId }
    };

    const res = makeRes();
    await orderController.createOrder(req, res);

    assert(res.statusCode === 201, 'Order with duplicate items created (201)');
    assert(createdDoc.products.length === 1, 'Duplicate entries consolidated into a single line item');
    assert(createdDoc.products[0].quantity === 3, 'Consolidated quantity is 1 + 2 = 3');
    assert(createdDoc.subtotal === 1200, 'Subtotal is 400 * 3 = 1200');
    assert(createdDoc.shippingFee === 0, 'Shipping fee is 0 (> 1000)');
    assert(createdDoc.gst === 60, 'GST is Math.round(1200 * 0.05) = 60');
    assert(createdDoc.totalAmount === 1260, 'Grand total is 1200 + 60 + 0 = 1260');

    Product.findById = origFind;
    Order.create = origCreate;
  }

  // Test 5b: Duplicate consolidation exceeding stock is properly caught
  {
    const dupStockProd = {
      _id: makeId(),
      title: 'Limited Rug',
      price: 1500,
      stockQuantity: 3, // stock is 3
      status: 'active',
      seller: sellerId,
      save: async () => {}
    };

    const origFind = Product.findById.bind(Product);
    Product.findById = async () => dupStockProd;

    const req = {
      body: {
        products: [
          { product: dupStockProd._id.toString(), quantity: 2 },
          { product: dupStockProd._id.toString(), quantity: 2 } // total 4 > stock 3
        ]
      },
      user: { _id: customerId }
    };

    const res = makeRes();
    await orderController.createOrder(req, res);
    assert(res.statusCode === 400 && res.body.message.includes('Insufficient stock'), 'Duplicate consolidation correctly triggers stock error (4 requested > 3 stock)');

    Product.findById = origFind;
  }

  // ───────────────────────────────────────────
  // 6. Payment Integration Regression
  // ───────────────────────────────────────────
  console.log('\n💳 6. Payment Integration Regression');

  // Test 6a: createPayment uses server-authoritative Order.totalAmount
  {
    const orderDoc = {
      _id: makeId(),
      customer: customerId,
      subtotal: 2400,
      gst: 120,
      shippingFee: 0,
      totalAmount: 2520,
      paymentStatus: 'pending',
      orderStatus: 'Pending',
      products: [],
      timeline: [],
      save: async () => {},
      populate: function() { return Promise.resolve(this); }
    };

    let paymentRecorded = null;
    const origPaymentCreate = Payment.create.bind(Payment);
    Payment.create = async (doc) => { paymentRecorded = doc; return doc; };

    const origOrderFind = Order.findById.bind(Order);
    Order.findById = () => ({ ...orderDoc, populate: () => Promise.resolve(orderDoc) });

    const req = {
      body: {
        orderId: orderDoc._id.toString(),
        paymentMethod: 'Cash on Delivery',
        amount: 99999 // Malicious client attempt to override amount
      },
      user: { _id: customerId, role: 'customer' }
    };

    const res = makeRes();
    await paymentController.createPayment(req, res);

    assert(paymentRecorded !== null, 'Payment record was created');
    assert(paymentRecorded.amount === 2520, 'Payment record used authoritative order total 2520');
    assert(paymentRecorded.amount !== 99999, 'Client amount 99999 was completely disregarded');

    Payment.create = origPaymentCreate;
    Order.findById = origOrderFind;
  }

  // ───────────────────────────────────────────
  // 7. Legacy Order Compatibility
  // ───────────────────────────────────────────
  console.log('\n🏛️  7. Legacy Order Breakdown Compatibility');

  // Test 7a: Legacy order without subtotal/gst/shippingFee does not hydrate default 0s
  {
    const legacyDoc = new Order({
      customer: customerId,
      totalAmount: 1800,
      products: [{ product: makeId(), quantity: 1, price: 1800 }]
    });

    const plainObj = legacyDoc.toObject();
    assert(plainObj.subtotal === undefined, 'Legacy order document does NOT hydrate subtotal with default 0');
    assert(plainObj.gst === undefined, 'Legacy order document does NOT hydrate gst with default 0');
    assert(plainObj.shippingFee === undefined, 'Legacy order document does NOT hydrate shippingFee with default 0');
    assert(plainObj.totalAmount === 1800, 'Legacy order preserves totalAmount 1800');
  }

  // Test 7b: Frontend display breakdown condition correctly flags legacy vs new orders
  {
    const isBreakdownValid = (ord) =>
      typeof ord?.subtotal === 'number' &&
      ord.subtotal > 0 &&
      typeof ord?.gst === 'number' &&
      typeof ord?.shippingFee === 'number';

    const legacyOrder = { totalAmount: 1500 }; // missing subtotal/gst/shippingFee
    assert(isBreakdownValid(legacyOrder) === false, 'Legacy order correctly identified as NOT having detailed breakdown (prevents fabricated 0s)');

    const legacyOrderWithZeroes = { totalAmount: 1500, subtotal: 0, gst: 0, shippingFee: 0 };
    assert(isBreakdownValid(legacyOrderWithZeroes) === false, 'Legacy order with zeroes correctly flagged as invalid breakdown (subtotal <= 0)');

    const newOrder = { totalAmount: 2520, subtotal: 2400, gst: 120, shippingFee: 0 };
    assert(isBreakdownValid(newOrder) === true, 'New order correctly identified as having authoritative detailed breakdown');
  }

  // ───────────────────────────────────────────
  // Summary
  // ───────────────────────────────────────────
  console.log('\n=============================================================');
  console.log(`PRICING TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('=============================================================\n');
  if (failed > 0) process.exit(1);
}

runPricingTests().catch((err) => {
  console.error('Fatal error in pricing test runner:', err);
  process.exit(1);
});
