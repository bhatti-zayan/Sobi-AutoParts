const userRepository = require('../adapters/database/repositories/MongoUserRepository');
const productRepository = require('../adapters/database/repositories/MongoProductRepository');
const orderRepository = require('../adapters/database/repositories/MongoOrderRepository');
const activityService = require('./activityService');

class AdminService {
  async getAllUsers() {
    return await userRepository.findAll();
  }

  async updateUserStatus(userId, isActive) {
    const user = await userRepository.updateStatus(userId, isActive);
    
    const ProductModel = require('../adapters/database/models/ProductModel');
    if (!isActive) {
      if (user.role === 'seller') {
        await ProductModel.updateMany(
          { sellerId: userId, status: 'live' },
          { $set: { status: 'suspended' } }
        );
      } else if (user.role === 'buyer') {
        // Void all active bids for this buyer
        await ProductModel.updateMany(
          { 'bids.user': userId, status: 'live' },
          { $pull: { bids: { user: userId } } }
        );
      }
      await activityService.log(`User ${user.name} deactivated. Listings/bids suspended.`, 'user_deactivation', userId);
    } else {
      if (user.role === 'seller') {
        await ProductModel.updateMany(
          { sellerId: userId, status: 'suspended' },
          { $set: { status: 'live' } }
        );
      }
      await activityService.log(`User ${user.name} reactivated. Listings restored.`, 'new_listing', userId);
    }
    
    return user;
  }

  async getAllProducts() {
    // For admin, we might want all products, but for now we just use the live ones as a shortcut.
    // Ideally we'd have a findAll in IProductRepository.
    return await productRepository.findAllLive(); 
  }
  
  async approveProduct(productId) {
     return await productRepository.update(productId, { status: 'live' });
  }

  async rejectProduct(productId) {
    return await productRepository.update(productId, { status: 'removed' });
  }

  async getAllOrders() {
    return await orderRepository.findAll();
  }

  async getActivities() {
    return await activityService.getAllActivities();
  }
}

module.exports = new AdminService();
