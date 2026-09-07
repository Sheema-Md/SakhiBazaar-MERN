/**
 * Server-Authoritative Pricing Utility
 *
 * Centralizes all financial calculations for orders and checkout.
 * Enforces business rules:
 * - Authoritative unit price from DB Product.price
 * - Quantity must be an integer >= 1
 * - Subtotal = sum of (unitPrice * quantity)
 * - GST = Math.round(subtotal * 0.05) (5% tax)
 * - Shipping fee: subtotal > 1000 -> 0, subtotal <= 1000 -> 99
 * - Grand total = subtotal + gst + shippingFee
 * - All monetary values are integer INR amounts
 */

/**
 * Calculate authoritative order pricing.
 *
 * @param {Array<{ productDoc: Object, quantity: number }>} items
 *        Array of items containing authoritative Product documents and validated quantities.
 * @returns {{
 *   orderItems: Array<{ product: any, quantity: number, price: number }>,
 *   subtotal: number,
 *   gst: number,
 *   shippingFee: number,
 *   totalAmount: number
 * }}
 */
function calculateOrderPricing(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Items array must be non-empty to calculate pricing');
  }

  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const { productDoc, quantity } = item;

    if (!productDoc) {
      throw new Error('Product document is required for pricing calculation');
    }

    if (typeof productDoc.price !== 'number' || isNaN(productDoc.price) || productDoc.price < 0) {
      throw new Error(`Invalid product price for product: ${productDoc._id || 'unknown'}`);
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error(`Quantity must be a positive integer >= 1, received: ${quantity}`);
    }

    const unitPrice = Math.round(productDoc.price);
    const itemSubtotal = unitPrice * quantity;
    subtotal += itemSubtotal;

    orderItems.push({
      product: productDoc._id,
      quantity,
      price: unitPrice,
    });
  }

  // 1. GST: 5% rounded to nearest whole INR rupee
  const gst = Math.round(subtotal * 0.05);

  // 2. Shipping: free (> 1000), flat rate 99 (<= 1000)
  // EXACT BOUNDARY PRESERVED: subtotal > 1000
  const shippingFee = subtotal > 1000 ? 0 : 99;

  // 3. Grand Total: sum of all authoritative components
  const totalAmount = subtotal + gst + shippingFee;

  return {
    orderItems,
    subtotal,
    gst,
    shippingFee,
    totalAmount,
  };
}

module.exports = {
  calculateOrderPricing,
};
