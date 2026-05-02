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

    // Fix 3: Block mode switching
    if (product.status === 'live' && updates.type && updates.type !== product.type) {
      throw { statusCode: 400, message: 'Cannot change the selling mode of a live listing' };
    }

    // Fix 1: Block editing core fields after bids placed
    if (product.bids && product.bids.length > 0) {
      const coreFields = ['title', 'price', 'startingPrice', 'type', 'bargainMin', 'bargainMax'];
      const isEditingCore = coreFields.some(field => field in updates && updates[field] !== product[field]);
      if (isEditingCore) {
        throw { statusCode: 400, message: 'Cannot edit core listing details after bids have been placed' };
      }
    }

    return await productRepository.update(productId, updates);
  }

  async deleteProduct(sellerId, productId, reason = 'removed') {
    const product = await productRepository.findById(productId);
    if (!product) throw { statusCode: 404, message: 'Product not found' };

    if (!product.isOwnedBy(sellerId)) {
      throw { statusCode: 403, message: 'Unauthorized to delete this product' };
    }

    // Fix 2: Block deleting listing with active bids or accepted offers
    const hasBids = product.bids && product.bids.length > 0;
    const hasAcceptedOffer = product.offers && product.offers.some(o => o.status === 'accepted');
    if (hasBids || hasAcceptedOffer) {
      throw { statusCode: 400, message: 'Cannot delete a listing with active bids or accepted offers' };
    }

    await activityService.log(`Listing removed — <b>${product.title}</b>`, 'user_deactivation', productId);

    return await productRepository.delete(productId);
  }

  async getMyOrders(sellerId) {
    return await orderRepository.findBySeller(sellerId);
  }

  async handleOffer(sellerId, productId, offerId, action) {
    const ProductModel = require('../adapters/database/models/ProductModel');
    const product = await ProductModel.findById(productId);
    if (!product) throw { statusCode: 404, message: 'Product not found' };
    
    const productSellerId = product.sellerId.id || product.sellerId._id || product.sellerId;
    if (productSellerId.toString() !== sellerId.toString()) throw { statusCode: 403, message: 'Unauthorized' };

    const offer = product.offers.id(offerId);
    if (!offer) throw { statusCode: 404, message: 'Offer not found' };

    if (action === 'accepted') {
      product.status = 'sold';
      product.offers.forEach(o => {
        if (o._id.toString() === offerId.toString()) {
          o.status = 'accepted';
        } else if (o.status === 'pending') {
          o.status = 'rejected_other';
        }
      });
      await product.save();

      const newOrder = new OrderEntity({
        buyerId: offer.buyerId.toString(),
        sellerId: sellerId.toString(),
        productId: product._id.toString(),
        item: product.title,
        method: 'bargain',
        amount: offer.amount,
        status: 'completed'
      });
      await orderRepository.create(newOrder);

      await activityService.log(`Offer accepted — <b>PKR ${offer.amount.toLocaleString()}</b> for ${product.title}`, 'offer_accepted', productId);
    } else {
      offer.status = 'rejected';
      await product.save();
    }

    return product;
  }
}

module.exports = new SellerService();
