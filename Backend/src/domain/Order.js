class Order {
  constructor({ id, buyerId, sellerId, productId, item, method, amount, status = 'completed', createdAt }) {
    this.id = id;
    this.buyerId = buyerId;
    this.sellerId = sellerId;
    this.productId = productId;
    this.item = item;
    this.method = method;
    this.amount = amount;
    this.status = status;
    this.createdAt = createdAt || new Date();
  }
}

module.exports = Order;
