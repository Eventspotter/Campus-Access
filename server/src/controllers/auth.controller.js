import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { publicUser } from '../models/User.js';
import { cookieOptions } from '../middleware/auth.middleware.js';

const dummyHash = bcrypt.hashSync('not-a-real-account-password', 12);

export async function login(req, res) {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string' || email.length > 254 || Buffer.byteLength(password) > 72) {
    return res.status(400).json({ message: 'Enter a valid email and password.' });
  }
  const user = await User.findOne({ email: email.trim().toLowerCase() })
    .select('+passwordHash +sessionVersion');
  const matches = await bcrypt.compare(password, user?.passwordHash || dummyHash);
  if (!user || !matches || !user.active) {
    return res.status(401).json({ message: 'Incorrect email or password.' });
  }
  const token = jwt.sign({ version: user.sessionVersion }, process.env.JWT_SECRET, {
    algorithm: 'HS256', subject: user.id, expiresIn: '8h', issuer: 'campus-access', audience: 'campus-web',
  });
  res.cookie('session', token, { ...cookieOptions(), maxAge: 8 * 60 * 60 * 1000 });
  res.json({ user: publicUser(user) });
}

export async function logout(req, res) {
  await User.updateOne({ _id: req.user.id }, { $inc: { sessionVersion: 1 } });
  res.clearCookie('session', cookieOptions());
  res.json({ message: 'Logged out.' });
}

export function me(req, res) {
  res.json({ user: publicUser(req.user) });
}
