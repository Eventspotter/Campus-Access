import 'dotenv/config';
import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { connectDB } from '../config/db.js';
import User, { nameKeys } from '../models/User.js';

// One-time deployment migration. Remove after the three login checks pass.
const passwordHash = '$2b$12$CZ4MQMRBPtgWE1BrNOsSN.UdcJex4FrvTbmfk.7yZfmYnhsj0W.3O';
const migrationId = 'requested-demo-logins-2026-10-19';
const accounts = [
  { email: 'admin@campus.local', role: 'admin', name: 'Orion Vale' },
  { email: 'faculty@campus.local', role: 'faculty', name: 'Lyra Chen' },
  { email: 'student@campus.local', role: 'student', name: 'Cassian Mercer', rollNumber: 'LOGIN-STUDENT-001' },
];

try {
  await connectDB();
  const migrations = mongoose.connection.collection('one_time_migrations');
  if (await migrations.findOne({ _id: migrationId })) console.log('Requested login setup already completed.');
  else {
    for (const account of accounts) {
      const existing = await User.findOne({ email: account.email });
      if (existing) {
        if (existing.role !== account.role) throw new Error(`Role mismatch for ${account.email}`);
        await User.updateOne({ _id: existing._id }, {
          $set: { passwordHash, active: true },
          $unset: { resetTokenHash: '', resetExpiresAt: '' },
          $inc: { sessionVersion: 1 },
        });
      } else {
        await User.create({
          ...account,
          ...nameKeys(account.name),
          passwordHash,
          ...(account.role === 'student' ? { studentQrId: randomUUID() } : {}),
        });
      }
      console.log(`Prepared ${account.role} login: ${account.email}`);
    }
    await migrations.insertOne({ _id: migrationId, completedAt: new Date() });
  }
} catch (error) {
  console.error('Requested login setup failed:', error.name, error.code || '');
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
