const UserModel = require('../models/UserModel');
const IUserRepository = require('../../../ports/IUserRepository');
const UserEntity = require('../../../domain/User');

/**
 * MongoUserRepository (Adapter)
 * 
 * Implements the IUserRepository port using MongoDB/Mongoose.
 */
class MongoUserRepository extends IUserRepository {
  
  // Helper to map Mongoose document to Domain Entity
  _mapToEntity(doc) {
    if (!doc) return null;
    return new UserEntity({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      password: doc.password,
      role: doc.role,
      initials: doc.initials,
      isActive: doc.isActive,
      createdAt: doc.createdAt
    });
  }

  async findById(id) {
    const userDoc = await UserModel.findById(id).select('-password');
    return this._mapToEntity(userDoc);
  }

  async findByEmail(email) {
    const userDoc = await UserModel.findOne({ email });
    return this._mapToEntity(userDoc);
  }

  async create(userEntity) {
    const userDoc = new UserModel({
      name: userEntity.name,
      email: userEntity.email,
      password: userEntity.password,
      role: userEntity.role,
      initials: userEntity.initials,
      isActive: userEntity.isActive
    });
    const savedDoc = await userDoc.save();
    return this._mapToEntity(savedDoc);
  }

  async updateStatus(id, isActive) {
    const updatedDoc = await UserModel.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password');
    return this._mapToEntity(updatedDoc);
  }

  async findAll() {
    const userDocs = await UserModel.find().select('-password');
    return userDocs.map(doc => this._mapToEntity(doc));
  }
}

module.exports = new MongoUserRepository();
