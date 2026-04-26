const productRepository = require('../adapters/database/repositories/MongoProductRepository');
const orderRepository = require('../adapters/database/repositories/MongoOrderRepository');
const activityService = require('./activityService');
const ProductEntity = require('../domain/Product');
const OrderEntity = require('../domain/Order');

class SellerService {
  async addProduct(sellerId, productData) {
    productData.sellerId = sellerId;
    const productEntity = new ProductEntity(productData);
    const product = await productRepository.create(productEntity);
    
    await activityService.log(`New listing — <b>${product.title}</b> by Seller ID ${sellerId}`, 'new_listing', product.id);
    
    return product;
  }

  async getMyProducts(sellerId) {
    return await productRepository.findBySeller(sellerId);
  }

  async updateProduct(sellerId, productId, updates) {
    const product = await productRepository.findById(productId);
    if (!product) throw { statusCode: 404, message: 'Product not found' };
    
    if (!product.isOwnedBy(sellerId)) {
      throw { statusCode: 403, message: 'Unauthorized to update this product' };
    }

    return await productRepository.update(productId, updates);
  }

  async deleteProduct(sellerId, productId, reason = 'removed') {
    const product = await productRepository.findById(productId);
    if (!product) throw { statusCode: 404, message: 'Product not found' };

    if (!product.isOwnedBy(sellerId)) {
      throw { statusCode: 403, message: 'Unauthorized to delete this product' };
    }

    await activityService.log(`Listing removed — <b>${product.title}</b>`, 'user_deactivation', productId);

    return await productRepository.delete(productId);
  }

  async getMyOrders(sellerId) {
    return await orderRepository.findBySeller(sellerId);
  }

  async handleOffer(sellerId, productId, offerId, action) {
    // action can be 'accepted' or 'rejected'
    const product = await productRepository.findById(productId);
    if (!product) throw { statusCode: 404, message: 'Product not found' };
    if (!product.isOwnedBy(sellerId)) throw { statusCode: 403, message: 'Unauthorized' };

    // This is a bit complex bcz it's an array inside Mongo
    // We'll use the raw model for simplicity in this specific logic if needed, 
    // but better to use repository if we can.
    
    // For now, let's update the specific offer status
    const updatedProduct = await productRepository.update(productId, {
      $set: { "offers.$[elem].status": action }
    }, {
      arrayFilters: [{ "elem._id": offerId }]
    });

    if (action === 'accepted') {
      const offer = product.offers.find(o => o._id.toString() === offerId);
      
      // Create an order if offer is accepted
      const newOrder = new OrderEntity({
        buyerId: offer.buyerId,
        sellerId: sellerId,
        productId: product.id,
        item: product.title,
        method: 'bargain',
        amount: offer.amount,
        status: 'completed'
      });
      await orderRepository.create(newOrder);
      
      // Mark product as sold
      await productRepository.update(productId, { status: 'sold' });

      await activityService.log(`Offer accepted — <b>PKR ${offer.amount.toLocaleString()}</b> for ${product.title}`, 'offer_accepted', productId);
    }

    return updatedProduct;
  }
}

module.exports = new SellerService();
