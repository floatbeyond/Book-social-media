import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function connectToMongo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas!');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

export default connectToMongo;
