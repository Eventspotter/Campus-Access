export const requireRole = role => (req, res, next) => {
  if (req.user.role !== role) return res.status(403).json({ message: 'You do not have permission to access this page.' });
  next();
};
