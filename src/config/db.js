const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbName = process.env.MONGO_DB_NAME || 'labtrack_db';
    await mongoose.connect(process.env.MONGO_URI, { dbName });
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
