class IProductRepository {
  async findAllLive() { throw new Error('Method not implemented.'); }
  async findById(id) { throw new Error('Method not implemented.'); }
  async findBySeller(sellerId) { throw new Error('Method not implemented.'); }
  async create(productEntity) { throw new Error('Method not implemented.'); }
  async update(id, updates) { throw new Error('Method not implemented.'); }
  async delete(id) { throw new Error('Method not implemented.'); }
}

module.exports = IProductRepository;
