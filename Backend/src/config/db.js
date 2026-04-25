const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // Use in-memory ONLY if no URI is provided
    if (!uri) {
      console.log('No MONGO_URI found. Starting in-memory MongoDB...');
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log('🧠 In-memory MongoDB started');
    }

    await mongoose.connect(uri);

    console.log(`MongoDB connected: ${uri}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
