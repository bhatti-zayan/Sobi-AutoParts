const productRepository = require('../adapters/database/repositories/MongoProductRepository');
const orderRepository = require('../adapters/database/repositories/MongoOrderRepository');
const activityService = require('./activityService');
const OrderEntity = require('../domain/Order');

class BuyerService {
  async getAllProducts() {
    return await productRepository.findAllLive();
  }

  async getProductById(productId) {
    const product = await productRepository.findById(productId);
    if (!product) throw { statusCode: 404, message: 'Product not found' };
    return product;
  }

  async placeOrder(buyerId, orderData) {
    const product = await productRepository.findById(orderData.productId);
    
    if (!product) throw { statusCode: 404, message: 'Product not found' };
    if (!product.isLive()) throw { statusCode: 400, message: 'Product is no longer available' };

    // Extract seller ID logic (handling both object mapping and plain strings)
    const sellerId = product.sellerId.id || product.sellerId._id || product.sellerId;

    const newOrder = new OrderEntity({
      buyerId,
      sellerId: sellerId,
      productId: product.id,
      item: product.title,
      method: orderData.method || product.type,
      amount: orderData.amount || product.price,
      status: 'completed'
    });

    const order = await orderRepository.create(newOrder);

    // Update product status to sold
    await productRepository.update(product.id, { status: 'sold' });

    // Log Activity
    await activityService.log(`Item purchased — <b>${product.title}</b> by User ID ${buyerId}`, 'offer_accepted', order._id);

    return order;
  }

  async getOrderHistory(buyerId) {
    return await orderRepository.findByBuyer(buyerId);
  }

  async placeBid(buyerId, productId, amount) {
    const product = await productRepository.findById(productId);
    if (!product) throw { statusCode: 404, message: 'Product not found' };
    if (product.type !== 'auction') throw { statusCode: 400, message: 'This product is not for auction' };
    if (amount <= (product.currentBid || product.startingPrice)) {
      throw { statusCode: 400, message: 'Bid must be higher than current bid' };
    }

    const updatedProduct = await productRepository.update(productId, {
      currentBid: amount,
      $push: { bids: { user: buyerId, amount, time: new Date() } }
    });

    await activityService.log(`New bid — <b>PKR ${amount.toLocaleString()}</b> on ${product.title}`, 'auction_end', productId);

    return updatedProduct;
  }

  async makeOffer(buyerId, productId, amount) {
    const product = await productRepository.findById(productId);
    if (!product) throw { statusCode: 404, message: 'Product not found' };
    if (product.type !== 'bargain') throw { statusCode: 400, message: 'This product does not support bargaining' };

    const updatedProduct = await productRepository.update(productId, {
      $push: { offers: { buyerId, amount, status: 'pending', time: new Date() } }
    });

    await activityService.log(`New offer — <b>PKR ${amount.toLocaleString()}</b> for ${product.title}`, 'offer_accepted', productId);

    return updatedProduct;
  }
}

module.exports = new BuyerService();
