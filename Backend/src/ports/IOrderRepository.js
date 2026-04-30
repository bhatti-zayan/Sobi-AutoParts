class IOrderRepository {
  async create(orderEntity) { throw new Error('Method not implemented.'); }
  async findByBuyer(buyerId) { throw new Error('Method not implemented.'); }
  async findBySeller(sellerId) { throw new Error('Method not implemented.'); }
  async findAll() { throw new Error('Method not implemented.'); }
}

module.exports = IOrderRepository;
