class Product {
  constructor({
    id, title, subtitle, description, category, condition,
    price, type, sellerId, sellerName, sellerInitials, status = 'live', images = [],
    startingPrice, currentBid, auctionEndTime, bids = [],
    bargainMin, bargainMax, offers = [],
    createdAt,
  }) {
    this.id = id;
    this.title = title;
    this.subtitle = subtitle;
    this.description = description;
    this.category = category;
    this.condition = condition;
    this.price = price;
    this.type = type;
    this.sellerId = sellerId;
    this.sellerName = sellerName;
    this.sellerInitials = sellerInitials;
    this.status = status;
    this.images = images;
    this.startingPrice = startingPrice;
    this.currentBid = currentBid;
    this.auctionEndTime = auctionEndTime;
    this.bids = bids;
    this.bargainMin = bargainMin;
    this.bargainMax = bargainMax;
    this.offers = offers;
    this.createdAt = createdAt || new Date();
  }

  isLive() {
    return this.status === 'live';
  }

  isOwnedBy(sellerId) {
    // Handling cases where sellerId might be an object or string
    const ownerId = this.sellerId._id ? this.sellerId._id.toString() : this.sellerId.toString();
    return ownerId === sellerId.toString();
  }
}

module.exports = Product;
