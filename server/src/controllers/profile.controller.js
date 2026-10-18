import { publicUser } from '../models/User.js';
import User from '../models/User.js';
import Notice from '../models/Notice.js';
import sharp from 'sharp';
export function getProfile(req, res) { res.json({ user: publicUser(req.user) }); }

export async function updateProfile(req, res) {
  const { department, contact } = req.body || {};
  if (typeof department !== 'string' || department.length > 80 ||
    typeof contact !== 'string' || contact.length > 40) {
    return res.status(400).json({ message: 'Enter valid department and contact details.' });
  }
  const user = await User.findByIdAndUpdate(req.user.id,
    { $set: { department: department.trim(), contact: contact.trim() } }, { new: true, runValidators: true });
  await Notice.create({ userId: user.id, kind: 'account', title: 'Profile updated',
    body: 'Your department or contact details were changed.' });
  res.json({ user: publicUser(user) });
}

export async function uploadAvatar(req, res) {
  if (!Buffer.isBuffer(req.body) || !req.body.length) return res.status(400).json({ message: 'Select an image.' });
  let image;
  try {
    const input = sharp(req.body, { limitInputPixels: 16000000 });
    const metadata = await input.metadata();
    if (!['jpeg', 'png', 'webp'].includes(metadata.format) || metadata.width < 64 || metadata.height < 64) {
      return res.status(400).json({ message: 'Use a JPEG, PNG or WebP image at least 64 pixels wide.' });
    }
    image = await input.rotate().resize(256, 256, { fit: 'cover' }).webp({ quality: 80 }).toBuffer();
  } catch { return res.status(400).json({ message: 'This image could not be read.' }); }
  const user = await User.findByIdAndUpdate(req.user.id,
    { $set: { avatarData: image, avatarUpdatedAt: new Date() } }, { new: true });
  await Notice.create({ userId: user.id, kind: 'account', title: 'Profile photo updated',
    body: 'Your account photo was changed.' });
  res.json({ user: publicUser(user) });
}

export async function getAvatar(req, res) {
  const user = await User.findById(req.user.id).select('+avatarData');
  if (!user.avatarData) return res.status(404).json({ message: 'No profile photo.' });
  res.type('image/webp').send(user.avatarData);
}
