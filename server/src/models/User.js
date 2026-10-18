import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  firstNameKey: { type: String, select: false },
  lastNameKey: { type: String, select: false },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, unique: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, required: true, enum: ['admin', 'faculty', 'student'] },
  department: { type: String, trim: true, maxlength: 80, default: '' },
  contact: { type: String, trim: true, maxlength: 40, default: '' },
  active: { type: Boolean, default: true },
  avatarData: { type: Buffer, select: false },
  avatarUpdatedAt: { type: Date },
  resetTokenHash: { type: String, select: false },
  resetExpiresAt: { type: Date, select: false },
  rollNumber: { type: String, trim: true, uppercase: true,
    required() { return this.role === 'student'; }, match: /^[A-Z0-9-]{2,30}$/ },
  studentQrId: { type: String, required() { return this.role === 'student'; } },
  sessionVersion: { type: Number, default: 0, select: false },
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String, select: false },
  mfaPendingSecret: { type: String, select: false },
  mfaLastStep: { type: Number, default: 0, select: false },
  mfaRecoveryHashes: { type: [String], default: [], select: false },
}, { timestamps: true });

userSchema.index({ rollNumber: 1 }, { unique: true, partialFilterExpression: { rollNumber: { $type: 'string' } } });
userSchema.index({ studentQrId: 1 }, { unique: true, partialFilterExpression: { studentQrId: { $type: 'string' } } });
userSchema.index({ firstNameKey: 1 }, { unique: true, partialFilterExpression: { firstNameKey: { $type: 'string' } } });
userSchema.index({ lastNameKey: 1 }, { unique: true, partialFilterExpression: { lastNameKey: { $type: 'string' } } });
userSchema.index({ resetTokenHash: 1 }, { unique: true, sparse: true });

export function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, mfaEnabled: user.mfaEnabled,
    rollNumber: user.rollNumber, studentQrId: user.studentQrId, department: user.department,
    contact: user.contact, active: user.active, avatarUpdatedAt: user.avatarUpdatedAt,
    createdAt: user.createdAt };
}

export function nameKeys(name) {
  if (typeof name !== 'string') throw Object.assign(new Error('Enter a first and last name.'), { status: 400 });
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2 || parts.some(part => !/^[\p{L}][\p{L}'-]*$/u.test(part))) {
    throw Object.assign(new Error('Enter a first and last name using letters.'), { status: 400 });
  }
  return { firstNameKey: parts[0].toLocaleLowerCase('en'), lastNameKey: parts.at(-1).toLocaleLowerCase('en') };
}

export async function createAccount(input, role) {
  const fail = message => { throw Object.assign(new Error(message), { status: 400 }); };
  if (!input || typeof input !== 'object') fail('Account details are required.');
  for (const field of ['name', 'email', 'password', ...(role === 'student' ? ['rollNumber'] : [])]) {
    if (typeof input[field] !== 'string' || !input[field].trim()) fail(`${field} is required.`);
  }
  if (input.password.length < 10 || Buffer.byteLength(input.password, 'utf8') > 72) {
    fail('Password must contain at least 10 characters and at most 72 UTF-8 bytes.');
  }
  const user = new User({ name: input.name, ...nameKeys(input.name), email: input.email, role,
    passwordHash: 'pending',
    department: typeof input.department === 'string' ? input.department : '',
    contact: typeof input.contact === 'string' ? input.contact : '',
    ...(role === 'student' ? { rollNumber: input.rollNumber, studentQrId: randomUUID() } : {}) });
  await user.validate();
  user.passwordHash = await bcrypt.hash(input.password, 12);
  return user.save();
}

const User = mongoose.model('User', userSchema);
export default User;
