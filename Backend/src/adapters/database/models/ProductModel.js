const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String, required: true },
  category: { type: String, required: true },
  condition: { type: String, enum: ['New', 'Used — Good', 'Used — Fair'], required: true },
  price: { type: Number, required: true },
  type: { type: String, enum: ['fixed', 'auction', 'bargain'], required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['live', 'sold', 'removed'], default: 'live' },
  
  // Auction specific
  startingPrice: { type: Number },
  currentBid: { type: Number },
  auctionEndTime: { type: Date },
  bids: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number },
    time: { type: Date, default: Date.now }
  }],
  
  // Bargain specific
  bargainMin: { type: Number },
  bargainMax: { type: Number },
  offers: [{
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    time: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
