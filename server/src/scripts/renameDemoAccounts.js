import 'dotenv/config';
import mongoose from 'mongoose';
import User, { nameKeys } from '../models/User.js';

const updates = [
  ['admin@campus.local', 'Campus Administrator'],
  ['faculty@campus.local', 'Mira Ellison'],
  ['student@campus.local', 'Nikhil Varma'],
];

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_access');
try {
  for (const [email, name] of updates) {
    const user = await User.findOne({ email });
    if (user && (user.name.startsWith('Demo ') || user.name === 'Campus Administrator')) {
      user.name = name;
      user.set(nameKeys(name));
      await user.save();
      console.log(`Updated ${email} display name.`);
    }
  }
} finally { await mongoose.disconnect(); }
