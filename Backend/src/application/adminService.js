const userRepository = require('../adapters/database/repositories/MongoUserRepository');
const productRepository = require('../adapters/database/repositories/MongoProductRepository');
const orderRepository = require('../adapters/database/repositories/MongoOrderRepository');
const activityService = require('./activityService');

class AdminService {
  async getAllUsers() {
    return await userRepository.findAll();
  }

  async updateUserStatus(userId, isActive) {
    return await userRepository.updateStatus(userId, isActive);
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
