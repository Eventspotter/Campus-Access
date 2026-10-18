import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import { connectDB } from './config/db.js';

function configurationError(message) {
  return Object.assign(new Error(message), { code: 'CONFIG' });
}

try {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith('replace-')) {
    throw configurationError('Set JWT_SECRET to at least 32 random characters in server/.env.');
  }
  if (!process.env.APP_ORIGIN) throw configurationError('Set APP_ORIGIN to the frontend origin in server/.env.');
  if (!process.env.MONGODB_URI) throw configurationError('Set MONGODB_URI to your MongoDB connection string in server/.env.');
  const port = Number(process.env.PORT || 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw configurationError('PORT must be between 1 and 65535.');
  const host = process.env.HOST || '127.0.0.1';

  await connectDB();
  const server = app.listen(port, host, () =>
    console.log(`API ready on http://${host}:${port}`)
  );
  server.on('error', error => {
    console.error('Server failed:', error.code || error.name);
    process.exit(1); 
  });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
    server.close(async () => { await mongoose.disconnect(); process.exit(0); });
  });
} catch (error) {
  if (error.code === 'CONFIG') console.error('Startup configuration error:', error.message);
  else console.error('MongoDB connection failed:', error.name, error.code || '', 'Check MONGODB_URI and database/network access.');
  process.exit(1); 
}
