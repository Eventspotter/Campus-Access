import User, { createAccount, publicUser } from '../models/User.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const createUser = role => async (req, res) => {
  const user = await createAccount(req.body, role);
  res.status(201).json({ user: publicUser(user) });
};

export const listUsers = role => async (req, res) => {
  const filter = { role };
  if (typeof req.query.department === 'string' && req.query.department.trim()) {
    filter.department = req.query.department.trim().slice(0, 80);
  }
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ users: users.map(publicUser) });
};

export const setActive = role => async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id) || typeof req.body?.active !== 'boolean') {
    return res.status(400).json({ message: 'Select an account and its new status.' });
  }
  const user = await User.findOneAndUpdate({ _id: req.params.id, role },
    { $set: { active: req.body.active }, $inc: { sessionVersion: 1 } }, { new: true });
  if (!user) return res.status(404).json({ message: 'Account not found.' });
  res.json({ user: publicUser(user) });
};

export async function changeAccountPassword(req, res) {
  const { newPassword } = req.body || {};
  if (!mongoose.isValidObjectId(req.params.id) || typeof newPassword !== 'string' ||
    newPassword.length < 10 || Buffer.byteLength(newPassword, 'utf8') > 72) {
    return res.status(400).json({ message: 'Choose an account and a password of at least 10 characters.' });
  }
  const passwordHash = await bcrypt.hash(newPassword, 12);
  const user = await User.findByIdAndUpdate(req.params.id, { $set: { passwordHash },
    $inc: { sessionVersion: 1 }, $unset: { resetTokenHash: '', resetExpiresAt: '' } }, { new: true });
  if (!user) return res.status(404).json({ message: 'Account not found.' });
  res.json({ user: publicUser(user), message: 'Password changed.' });
}
