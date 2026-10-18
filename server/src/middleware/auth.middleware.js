import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const cookieOptions = () => ({ httpOnly: true, sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production', path: '/' });

export async function requireAuth(req, res, next) {
  let payload;
  try {
    payload = jwt.verify(req.cookies.session, process.env.JWT_SECRET, {
      algorithms: ['HS256'], issuer: 'campus-access', audience: 'campus-web',
    });
  } catch {
    return res.status(401).json({ message: 'Please log in to continue.' });
  }
  if (!/^[a-f\d]{24}$/i.test(payload.sub || '')) return res.status(401).json({ message: 'Invalid session.' });
  const user = await User.findById(payload.sub).select('+sessionVersion');
  if (!user || !user.active || user.sessionVersion !== payload.version) {
    return res.status(401).json({ message: 'Your session has ended. Please log in again.' });
  }
  req.user = user;
  next();
}
