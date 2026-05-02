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
      sellerId: doc.sellerId?._id ? doc.sellerId._id.toString() : doc.sellerId,
      sellerName: doc.sellerId?.name || '',
      sellerInitials: doc.sellerId?.initials || '',
      status: doc.status,
      images: doc.images,
      startingPrice: doc.startingPrice,
      currentBid: doc.currentBid,
      auctionEndTime: doc.auctionEndTime,
      bargainMin: doc.bargainMin,
      bargainMax: doc.bargainMax,
      bids: doc.bids,
      offers: doc.offers,
      createdAt: doc.createdAt
    });
  }

  async findAllLive(query = {}) {
    const { search, category, minPrice, maxPrice, type, page = 1, limit = 10 } = query;
    const filter = { status: 'live' };
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) filter.category = category;
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    if (type) filter.type = type;
    
    const skip = (Number(page) - 1) * Number(limit);
    const docs = await ProductModel.find(filter)
      .populate('sellerId', 'name initials')
      .skip(skip)
      .limit(Number(limit));
      
    const total = await ProductModel.countDocuments(filter);
    
    return {
      data: docs.map(doc => this._mapToEntity(doc)),
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    };
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
