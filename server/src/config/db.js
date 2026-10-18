import mongoose from 'mongoose';
import User from '../models/User.js';

export async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required. Configure server/.env.');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  await User.init();
}
