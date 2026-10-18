import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User, { createAccount } from '../models/User.js';

try {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) throw Object.assign(new Error('ADMIN_EMAIL is required.'), { status: 400 });
  if (!process.env.ADMIN_PASSWORD) throw Object.assign(new Error('ADMIN_PASSWORD is required.'), { status: 400 });
  await connectDB();
  const existing = email ? await User.findOne({ email }) : null;
  if (existing && existing.role !== 'admin') throw Object.assign(new Error('ADMIN_EMAIL belongs to a non-admin account.'), { status: 400 });
  if (existing) console.log('Admin already exists; password was not changed.');
  else {
    await createAccount({ name: process.env.ADMIN_NAME || 'Campus Administrator', email, password: process.env.ADMIN_PASSWORD }, 'admin');
    console.log('Admin created. Use the credentials in your local server/.env.');
  }
} catch (error) { console.error('Seed failed; check admin configuration and database availability.', error.status === 400 ? error.message : error.name, error.code || ''); process.exitCode = 1; }
finally { await mongoose.disconnect(); }
