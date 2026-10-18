import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { generateSecret, generateURI, verify } from 'otplib';
import User from '../models/User.js';

function key() {
  const value = process.env.MFA_ENCRYPTION_KEY;
  if (!/^[a-f\d]{64}$/i.test(value || '')) throw new Error('MFA_ENCRYPTION_KEY must be 64 hexadecimal characters.');
  return Buffer.from(value, 'hex');
}

export function encryptSecret(secret) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map(part => part.toString('base64url')).join('.');
}

export function decryptSecret(value) {
  const [iv, tag, ciphertext] = value.split('.').map(part => Buffer.from(part, 'base64url'));
  const decipher = createDecipheriv('aes-256-gcm', key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

export function newEnrollment(email) {
  const secret = generateSecret();
  return { secret, uri: generateURI({ issuer: 'Campus Access', label: email, secret }) };
}

export async function checkTotp(secret, token, afterTimeStep = 0) {
  if (typeof token !== 'string' || !/^\d{6}$/.test(token)) return null;
  try {
    const result = await verify({ secret, token, epochTolerance: 30, afterTimeStep });
    return result.valid ? result.timeStep : null;
  } catch { return null; }
}

const recoveryHash = code => createHash('sha256').update(code).digest('hex');

export function newRecoveryCodes() {
  const codes = Array.from({ length: 8 }, () => randomBytes(16).toString('hex').toUpperCase());
  return { codes, hashes: codes.map(recoveryHash) };
}

export async function consumeMfa(user, code) {
  if (typeof code !== 'string') return false;
  const normalized = code.trim().replaceAll('-', '').toUpperCase();
  if (/^[A-F\d]{32}$/.test(normalized)) {
    const result = await User.updateOne({ _id: user.id, mfaRecoveryHashes: recoveryHash(normalized) },
      { $pull: { mfaRecoveryHashes: recoveryHash(normalized) } });
    return result.modifiedCount === 1;
  }
  const timeStep = await checkTotp(decryptSecret(user.mfaSecret), normalized, user.mfaLastStep || 0);
  if (timeStep === null) return false;
  const result = await User.updateOne({ _id: user.id, mfaLastStep: { $lt: timeStep } },
    { $set: { mfaLastStep: timeStep } });
  return result.modifiedCount === 1;
}

export { recoveryHash };
