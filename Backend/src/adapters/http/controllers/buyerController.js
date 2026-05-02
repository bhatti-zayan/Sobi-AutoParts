const buyerService = require('../../../application/buyerService');

class BuyerController {
  async getProducts(req, res, next) {
    try {
      const result = await buyerService.getAllProducts(req.query);
      if (Array.isArray(result)) {
        res.status(200).json({ success: true, data: result });
      } else {
        res.status(200).json({ success: true, ...result });
      }
    } catch (error) {
      next(error);
    }
  }

  async getProduct(req, res, next) {
    try {
      const product = await buyerService.getProductById(req.params.id);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async placeOrder(req, res, next) {
    try {
      const order = await buyerService.placeOrder(req.user.id, req.body);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req, res, next) {
    try {
      const orders = await buyerService.getOrderHistory(req.user.id);
      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  async placeBid(req, res, next) {
    try {
      const { productId, amount } = req.body;
      const product = await buyerService.placeBid(req.user.id, productId, amount);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async makeOffer(req, res, next) {
    try {
      const { productId, amount } = req.body;
      const product = await buyerService.makeOffer(req.user.id, productId, amount);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async getBids(req, res, next) {
    try {
      const bids = await buyerService.getMyBids(req.user.id);
      res.status(200).json({ success: true, data: bids });
    } catch (error) {
      next(error);
    }
  }

  async getOffers(req, res, next) {
    try {
      const offers = await buyerService.getMyOffers(req.user.id);
      res.status(200).json({ success: true, data: offers });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BuyerController();
