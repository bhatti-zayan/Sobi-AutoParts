const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['user_registration', 'auction_end', 'offer_accepted', 'new_listing', 'user_deactivation'], 
    required: true 
  },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
