import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import { connectDB } from './config/db.js';

try {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith('replace-')) {
    throw new Error('Set a random JWT_SECRET of at least 32 characters in server/.env.');
  }
  if (!process.env.APP_ORIGIN) throw new Error('APP_ORIGIN is required.');
  if (!/^[a-f\d]{64}$/i.test(process.env.MFA_ENCRYPTION_KEY || '')) {
    throw new Error('Set a random MFA_ENCRYPTION_KEY of 64 hexadecimal characters in server/.env.');
  }
  await connectDB();
  const server = app.listen(process.env.PORT || 4000, '127.0.0.1', () => console.log(`API ready on http://localhost:${process.env.PORT || 4000}`));
  server.on('error', error => { console.error('Server failed:', error.name, error.code || ''); process.exit(1); });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
    server.close(async () => { await mongoose.disconnect(); process.exit(0); });
  });
} catch (error) { console.error('Startup failed; check server configuration and database availability.', error.name, error.code || ''); process.exit(1); }
