import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import User from '../models/User.js';

const hash = token => createHash('sha256').update(token).digest('hex');

export async function requestReset(req, res) {
  const email = req.body?.email;
  if (typeof email !== 'string' || email.length > 254) return res.status(400).json({ message: 'Enter an email address.' });
  const user = await User.findOne({ email: email.trim().toLowerCase(), active: true });
  if (user && process.env.SMTP_HOST && process.env.SMTP_FROM && process.env.RESET_ORIGIN) {
    const token = randomBytes(32).toString('hex');
    const url = new URL('/reset-password', process.env.RESET_ORIGIN);
    url.searchParams.set('token', token);
    await User.updateOne({ _id: user.id }, { $set: {
      resetTokenHash: hash(token), resetExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
    } });
    const mail = nodemailer.createTransport({ host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587), secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined });
    await mail.sendMail({ from: process.env.SMTP_FROM, to: user.email,
      subject: 'Campus Access password reset',
      text: `A password reset was requested for your account. This link expires in 15 minutes:\n${url.toString()}\n\nIf you did not request it, ignore this email.` });
  }
  res.json({ message: 'If the account exists and email delivery is configured, a reset link will arrive shortly.' });
}

export async function resetPassword(req, res) {
  const { token, password } = req.body || {};
  if (typeof token !== 'string' || !/^[a-f\d]{64}$/.test(token) || typeof password !== 'string' ||
    password.length < 10 || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ message: 'Enter a valid reset link and a password of at least 10 characters.' });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.findOneAndUpdate({ resetTokenHash: hash(token),
    resetExpiresAt: { $gt: new Date() }, active: true },
    { $set: { passwordHash }, $unset: { resetTokenHash: '', resetExpiresAt: '' },
      $inc: { sessionVersion: 1 } });
  if (!user) return res.status(400).json({ message: 'This reset link is invalid or expired.' });
  res.json({ message: 'Password changed. You can sign in now.' });
}
