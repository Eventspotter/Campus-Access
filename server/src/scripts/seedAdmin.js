import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User, { createAccount } from '../models/User.js';

try {
  await connectDB();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const existing = email ? await User.findOne({ email }) : null;
  if (existing && existing.role !== 'admin') throw new Error('This email belongs to a non-admin account.');
  if (existing) console.log('Admin already exists; password was not changed.');
  else {
    await createAccount({ name: process.env.ADMIN_NAME || 'Campus Administrator', email, password: process.env.ADMIN_PASSWORD }, 'admin');
    console.log('Admin created. Use the credentials in your local server/.env.');
  }
} catch (error) { console.error('Seed failed; check admin configuration and database availability.', error.name, error.code || ''); process.exitCode = 1; }
finally { await mongoose.disconnect(); }
