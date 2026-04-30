class Activity {
  constructor({ id, text, type, referenceId, createdAt }) {
    this.id = id;
    this.text = text; // Human readable description e.g. "New user registered — Zayan Ahmed"
    this.type = type; // e.g. 'user_registration', 'auction_end', 'offer_accepted', 'new_listing'
    this.referenceId = referenceId; // ID of the related object (user, product, or order)
    this.createdAt = createdAt || new Date();
  }
}

module.exports = Activity;
