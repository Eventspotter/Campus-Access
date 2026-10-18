import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { publicUser } from '../models/User.js';
import { cookieOptions } from '../middleware/auth.middleware.js';
import { checkTotp, consumeMfa, decryptSecret, encryptSecret, newEnrollment, newRecoveryCodes } from '../config/mfa.js';

// Match the real hash cost even when the email is unknown.
const dummyHash = bcrypt.hashSync('not-a-real-account-password', 12);

export async function login(req, res) {
  const { email, password, mfaCode } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string' || email.length > 254 || Buffer.byteLength(password) > 72) {
    return res.status(400).json({ message: 'Enter a valid email and password.' });
  }
  const user = await User.findOne({ email: email.trim().toLowerCase() })
    .select('+passwordHash +sessionVersion +mfaSecret +mfaLastStep +mfaRecoveryHashes');
  const matches = await bcrypt.compare(password, user?.passwordHash || dummyHash);
  if (!user || !matches || !user.active) return res.status(401).json({ message: 'Incorrect email or password.' });
  if (user.mfaEnabled) {
    if (!mfaCode) return res.status(202).json({ mfaRequired: true });
    if (!await consumeMfa(user, mfaCode)) {
      return res.status(401).json({ message: 'Incorrect email, password, or verification code.' });
    }
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

export function me(req, res) { res.json({ user: publicUser(req.user) }); }

export async function setupMfa(req, res) {
  const user = await User.findById(req.user.id).select('+passwordHash');
  if (user.mfaEnabled) return res.status(409).json({ message: 'Authenticator verification is already enabled.' });
  if (typeof req.body?.password !== 'string' || !await bcrypt.compare(req.body.password, user.passwordHash)) {
    return res.status(401).json({ message: 'Enter your current password to set up verification.' });
  }
  const { secret, uri } = newEnrollment(user.email);
  user.mfaPendingSecret = encryptSecret(secret);
  await User.updateOne({ _id: user.id }, { $set: { mfaPendingSecret: user.mfaPendingSecret } });
  res.json({ secret, uri });
}

export async function confirmMfa(req, res) {
  const user = await User.findById(req.user.id).select('+mfaPendingSecret');
  if (user.mfaEnabled) return res.status(409).json({ message: 'Authenticator verification is already enabled.' });
  if (!user.mfaPendingSecret) return res.status(400).json({ message: 'Start authenticator setup first.' });
  const timeStep = await checkTotp(decryptSecret(user.mfaPendingSecret), req.body?.code);
  if (timeStep === null) return res.status(400).json({ message: 'Enter a current six-digit authenticator code.' });
  const { codes, hashes } = newRecoveryCodes();
  const activation = await User.updateOne({ _id: user.id, mfaEnabled: { $ne: true } }, {
    $set: { mfaEnabled: true, mfaSecret: user.mfaPendingSecret, mfaLastStep: timeStep, mfaRecoveryHashes: hashes },
    $unset: { mfaPendingSecret: '' },
  });
  if (activation.modifiedCount !== 1) return res.status(409).json({ message: 'Authenticator setup changed. Start again.' });
  res.json({ recoveryCodes: codes });
}

export async function disableMfa(req, res) {
  const user = await User.findById(req.user.id)
    .select('+passwordHash +mfaSecret +mfaLastStep +mfaRecoveryHashes');
  if (!user.mfaEnabled) return res.status(409).json({ message: 'Authenticator verification is not enabled.' });
  if (typeof req.body?.password !== 'string' || !await bcrypt.compare(req.body.password, user.passwordHash)) {
    return res.status(401).json({ message: 'Enter your current password.' });
  }
  if (!await consumeMfa(user, req.body?.code)) return res.status(401).json({ message: 'Enter a valid authenticator or recovery code.' });
  await User.updateOne({ _id: user.id }, {
    $set: { mfaEnabled: false, mfaLastStep: 0, mfaRecoveryHashes: [] },
    $unset: { mfaSecret: '', mfaPendingSecret: '' },
  });
  res.json({ message: 'Authenticator verification disabled.' });
}
