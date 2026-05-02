const cron = require('node-cron');
const ProductModel = require('./adapters/database/models/ProductModel');

const startCronJobs = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // Find all live auctions that have passed their end time
      const endedAuctions = await ProductModel.find({
        type: 'auction',
        status: 'live',
        auctionEndTime: { $lte: now }
      });

      for (const auction of endedAuctions) {
        auction.status = 'closed';
        
        if (auction.bids && auction.bids.length > 0) {
          // Bids are pushed sequentially, so the last one is the highest
          const highestBidId = auction.bids[auction.bids.length - 1]._id;
          
          auction.bids.forEach(bid => {
            if (bid._id.toString() === highestBidId.toString()) {
              bid.status = 'won';
            } else {
              bid.status = 'lost';
            }
          });
        }
        
        await auction.save();
        console.log(`Auto-closed auction for product: ${auction._id}`);
      }
    } catch (error) {
      console.error('Error in auto-closure cron job:', error);
    }
  });
};

module.exports = startCronJobs;
