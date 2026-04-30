const ActivityModel = require('../adapters/database/models/ActivityModel');

class ActivityService {
  async log(text, type, referenceId = null) {
    try {
      return await ActivityModel.create({
        text,
        type,
        referenceId
      });
    } catch (error) {
      console.error('❌ Activity logging failed:', error.message);
    }
  }

  async getAllActivities(limit = 10) {
    return await ActivityModel.find()
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

module.exports = new ActivityService();
