const OrderModel = require('../models/OrderModel');
const IOrderRepository = require('../../../ports/IOrderRepository');
const OrderEntity = require('../../../domain/Order');

class MongoOrderRepository extends IOrderRepository {
  
  _mapToEntity(doc) {
    if (!doc) return null;
    return new OrderEntity({
      id: doc._id.toString(),
      buyerId: doc.buyerId,
      sellerId: doc.sellerId,
      productId: doc.productId,
      item: doc.item,
      method: doc.method,
      amount: doc.amount,
      status: doc.status,
      createdAt: doc.createdAt
    });
  }

  async create(orderEntity) {
    const doc = new OrderModel(orderEntity);
    const saved = await doc.save();
    return this._mapToEntity(saved);
  }

  async findByBuyer(buyerId) {
    const docs = await OrderModel.find({ buyerId }).populate('productId', 'title image').populate('sellerId', 'name initials');
    return docs.map(doc => this._mapToEntity(doc));
  }

  async findBySeller(sellerId) {
    const docs = await OrderModel.find({ sellerId }).populate('productId', 'title').populate('buyerId', 'name initials');
    return docs.map(doc => this._mapToEntity(doc));
  }

  async findAll() {
    const docs = await OrderModel.find().populate('productId', 'title').populate('buyerId', 'name').populate('sellerId', 'name');
    return docs.map(doc => this._mapToEntity(doc));
  }
}

module.exports = new MongoOrderRepository();
