const ProductModel = require('../models/ProductModel');
const IProductRepository = require('../../../ports/IProductRepository');
const ProductEntity = require('../../../domain/Product');

class MongoProductRepository extends IProductRepository {
  
  _mapToEntity(doc) {
    if (!doc) return null;
    return new ProductEntity({
      id: doc._id.toString(),
      title: doc.title,
      subtitle: doc.subtitle,
      description: doc.description,
      category: doc.category,
      condition: doc.condition,
      price: doc.price,
      type: doc.type,
      sellerId: doc.sellerId,
      status: doc.status,
      startingPrice: doc.startingPrice,
      currentBid: doc.currentBid,
      auctionEndTime: doc.auctionEndTime,
      bargainMin: doc.bargainMin,
      bargainMax: doc.bargainMax,
      createdAt: doc.createdAt
    });
  }

  async findAllLive() {
    const docs = await ProductModel.find({ status: 'live' }).populate('sellerId', 'name initials');
    return docs.map(doc => this._mapToEntity(doc));
  }

  async findById(id) {
    const doc = await ProductModel.findById(id).populate('sellerId', 'name initials');
    return this._mapToEntity(doc);
  }

  async findBySeller(sellerId) {
    const docs = await ProductModel.find({ sellerId });
    return docs.map(doc => this._mapToEntity(doc));
  }

  async create(productEntity) {
    const doc = new ProductModel(productEntity);
    const saved = await doc.save();
    return this._mapToEntity(saved);
  }

  async update(id, updates) {
    const doc = await ProductModel.findByIdAndUpdate(id, updates, { new: true });
    return this._mapToEntity(doc);
  }

  async delete(id) {
    const doc = await ProductModel.findByIdAndDelete(id);
    return this._mapToEntity(doc);
  }
}

module.exports = new MongoProductRepository();
