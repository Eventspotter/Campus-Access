import mongoose from 'mongoose';
import User from '../models/User.js';

export function mongoUri() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required. Configure server/.env.');
  if (!process.env.MONGODB_PASSWORD) return process.env.MONGODB_URI;
  if (!process.env.MONGODB_USER) throw new Error('MONGODB_USER is required when MONGODB_PASSWORD is set.');
  const uri = new URL(process.env.MONGODB_URI);
  uri.username = process.env.MONGODB_USER;
  uri.password = process.env.MONGODB_PASSWORD;
  return uri.toString();
}

export async function connectDB() {
  await mongoose.connect(mongoUri(), { serverSelectionTimeoutMS: 10000 });
  await User.init();
}
