const productRepository = require('../adapters/database/repositories/MongoProductRepository');
const orderRepository = require('../adapters/database/repositories/MongoOrderRepository');
const activityService = require('./activityService');
const OrderEntity = require('../domain/Order');

class BuyerService {
  async getAllProducts(query = {}) {
    return await productRepository.findAllLive(query);
  }

  async getProductById(productId) {
    const product = await productRepository.findById(productId);
    if (!product) throw { statusCode: 404, message: 'Product not found' };
    return product;
  }

  async placeOrder(buyerId, orderData) {
    const ProductModel = require('../adapters/database/models/ProductModel');

    // Find product to validate amount
    const product = await ProductModel.findById(orderData.productId);
    if (!product) throw { statusCode: 404, message: 'Product not found' };

    const amount = Number(orderData.amount);
    const method = orderData.method || product.type;

    if (method === 'auction') {
      if (product.status !== 'closed') throw { statusCode: 400, message: 'Auction is not closed yet or already sold' };
    } else {
      if (product.status !== 'live') throw { statusCode: 400, message: 'Product is no longer available' };
    }

    if (method === 'fixed') {
      if (amount !== product.price) throw { statusCode: 400, message: 'Invalid purchase amount' };
    } else if (method === 'bargain') {
      const acceptedOffer = product.offers.find(
        (o) => o.buyerId.toString() === buyerId.toString() && o.status === 'accepted'
      );
      if (!acceptedOffer || amount !== acceptedOffer.amount) {
        throw { statusCode: 400, message: 'Invalid purchase amount' };
      }
    } else if (method === 'auction') {
      if (!product.bids || product.bids.length === 0) throw { statusCode: 400, message: 'No bids on this product' };
      const winningBid = product.bids.find(b => b.status === 'won');
      if (!winningBid || winningBid.user.toString() !== buyerId.toString()) {
        throw { statusCode: 403, message: 'You did not win this auction' };
      }
      if (amount !== winningBid.amount) {
        throw { statusCode: 400, message: 'Invalid purchase amount' };
      }
    }

    // Atomic update to prevent double-purchase
    const queryStatus = method === 'auction' ? 'closed' : 'live';
    const updatedProduct = await ProductModel.findOneAndUpdate(
      { _id: orderData.productId, status: queryStatus },
      { $set: { status: 'sold' } },
      { new: true }
    );

    if (!updatedProduct) {
      throw { statusCode: 400, message: 'Item is no longer available' };
    }

    const sellerId = product.sellerId;

    const newOrder = new OrderEntity({
      buyerId,
      sellerId: sellerId.toString(),
      productId: product._id.toString(),
      item: product.title,
      method: method,
      amount: amount,
      status: 'completed'
    });

    const order = await orderRepository.create(newOrder);

    // Log Activity
    await activityService.log(`Item purchased — <b>${product.title}</b> by User ID ${buyerId}`, 'offer_accepted', order._id);

    return order;
  }

  async getOrderHistory(buyerId) {
    return await orderRepository.findByBuyer(buyerId);
  }

  async placeBid(buyerId, productId, amount) {
    const product = await productRepository.findById(productId);
    if (!product) throw { statusCode: 404, message: 'Product not found' };
    if (product.type !== 'auction') throw { statusCode: 400, message: 'This product is not for auction' };

    // 1. Check if auction has ended
    if (product.auctionEndTime && new Date() > new Date(product.auctionEndTime)) {
      throw { statusCode: 400, message: 'This auction has already ended' };
    }

    // 2. Block seller from bidding on their own listing
    const sellerId = product.sellerId.id || product.sellerId._id || product.sellerId;
    if (buyerId.toString() === sellerId.toString()) {
      throw { statusCode: 403, message: 'You cannot bid on your own listing' };
    }

    // 3. Minimum bid increment of 100 PKR
    const currentHighest = product.currentBid || product.startingPrice || 0;
    if (amount < currentHighest + 100) {
      throw { statusCode: 400, message: `Bid must be at least 100 PKR higher than the current bid of ${currentHighest} PKR` };
    }

    const updatedProduct = await productRepository.update(productId, {
      currentBid: amount,
      $push: { bids: { user: buyerId, amount, time: new Date() } }
    });

    await activityService.log(`New bid — <b>PKR ${amount.toLocaleString()}</b> on ${product.title}`, 'auction_end', productId);

    return updatedProduct;
  }

  async makeOffer(buyerId, productId, amount) {
    const product = await productRepository.findById(productId);
    if (!product) throw { statusCode: 404, message: 'Product not found' };
    if (product.type !== 'bargain') throw { statusCode: 400, message: 'This product does not support bargaining' };

    // Check offer is within the allowed bargaining range
    if (amount < product.bargainMin || amount > product.bargainMax) {
      throw {
        statusCode: 400,
        message: `Offer must be between ${product.bargainMin} and ${product.bargainMax} PKR`
      };
    }

    // Block buyer from sending a second pending offer on the same product
    const ProductModel = require('../adapters/database/models/ProductModel');
    const doc = await ProductModel.findById(productId);
    const alreadyPending = doc.offers.some(
      (o) => o.buyerId.toString() === buyerId.toString() && o.status === 'pending'
    );
    if (alreadyPending) {
      throw { statusCode: 400, message: 'You already have a pending offer on this listing' };
    }

    const updatedProduct = await productRepository.update(productId, {
      $push: { offers: { buyerId, amount, status: 'pending', time: new Date() } }
    });

    await activityService.log(`New offer — <b>PKR ${amount.toLocaleString()}</b> for ${product.title}`, 'offer_accepted', productId);

    return updatedProduct;
  }

  async getMyBids(buyerId) {
    const ProductModel = require('../adapters/database/models/ProductModel');
    const productsWithBids = await ProductModel.find({ 'bids.user': buyerId });
    return productsWithBids.map(p => {
      const myBids = p.bids.filter(b => b.user.toString() === buyerId.toString());
      const myHighest = Math.max(...myBids.map(b => b.amount));
      const winningBid = p.bids.find(b => b.status === 'won');
      const isWinner = winningBid && winningBid.user.toString() === buyerId.toString();
      
      let status = 'Outbid';
      if (p.currentBid === myHighest) status = 'Winning';
      if (p.status === 'closed' && isWinner) status = 'Won';
      if (p.status === 'sold') status = isWinner ? 'Won' : 'Lost';

      return {
        id: p._id,
        productId: p._id,
        item: p.title,
        yourBid: myHighest,
        currentBid: p.currentBid || p.startingPrice,
        endsIn: p.status === 'live' ? 'Active' : 'Closed',
        status: status,
        purchased: p.status === 'sold' && isWinner
      };
    });
  }

  async getMyOffers(buyerId) {
    const ProductModel = require('../adapters/database/models/ProductModel');
    const productsWithOffers = await ProductModel.find({ 'offers.buyerId': buyerId });
    return productsWithOffers.map(p => {
      const myOffer = p.offers.find(o => o.buyerId.toString() === buyerId.toString());
      return {
        id: myOffer._id,
        productId: p._id,
        item: p.title,
        offered: myOffer.amount,
        listed: p.price,
        time: new Date(myOffer.time).toLocaleString(),
        status: myOffer.status
      };
    });
  }
}

module.exports = new BuyerService();
