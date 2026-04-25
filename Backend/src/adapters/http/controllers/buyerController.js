const buyerService = require('../../../application/buyerService');

class BuyerController {
  async getProducts(req, res, next) {
    try {
      console.log('🔍 Fetching all products...');
      const products = await buyerService.getAllProducts();
      console.log(`✅ Found ${products.length} products`);
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  async getProduct(req, res, next) {
    try {
      console.log(`🔍 Fetching product with ID: ${req.params.id}`);
      const product = await buyerService.getProductById(req.params.id);
      console.log(`✅ Product found: ${product.title}`);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async placeOrder(req, res, next) {
    try {
      console.log(`🛒 Placing order for user ${req.user.id}...`);
      const order = await buyerService.placeOrder(req.user.id, req.body);
      console.log(`✅ Order created successfully: ${order._id}`);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req, res, next) {
    try {
      console.log(`📜 Fetching order history for user ${req.user.id}...`);
      const orders = await buyerService.getOrderHistory(req.user.id);
      console.log(`✅ Found ${orders.length} orders in history`);
      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BuyerController();
