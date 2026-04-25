const sellerService = require('../../../application/sellerService');

class SellerController {
  async createProduct(req, res, next) {
    try {
      const product = await sellerService.addProduct(req.user.id, req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async getProducts(req, res, next) {
    try {
      const products = await sellerService.getMyProducts(req.user.id);
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const product = await sellerService.updateProduct(req.user.id, req.params.id, req.body);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      await sellerService.deleteProduct(req.user.id, req.params.id);
      res.status(200).json({ success: true, message: 'Product removed' });
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req, res, next) {
    try {
      const orders = await sellerService.getMyOrders(req.user.id);
      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SellerController();
