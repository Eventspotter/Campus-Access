import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import profileRoutes from './routes/profile.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();

function isAllowedOrigin(origin) {
  if (!origin || !process.env.APP_ORIGIN) return false;
  if (origin === process.env.APP_ORIGIN) return true;
  if (process.env.NODE_ENV === 'production') return false;
  try {
    const configured = new URL(process.env.APP_ORIGIN);
    const requested = new URL(origin);
    return requested.origin === origin && configured.protocol === 'http:' && requested.protocol === 'http:' &&
      configured.port === requested.port &&
      ['localhost', '127.0.0.1'].includes(configured.hostname) &&
      ['localhost', '127.0.0.1'].includes(requested.hostname);
  } catch { return false; }
}

app.use(helmet());
app.use('/api', rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many requests. Try again shortly.' }
}));
app.use(express.json({ limit: '16kb' }));
app.use(cookieParser());

app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    if (!isAllowedOrigin(req.get('Origin'))) {
      return res.status(403).json({ message: 'Request origin is not allowed.' });
    }
    const avatarUpload = req.path === '/profile/avatar' && req.is(['image/jpeg', 'image/png', 'image/webp']);
    if (!avatarUpload && !req.is('application/json')) {
      return res.status(415).json({ message: 'Use the supported request format.' });
    }
  }
  next();
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);

if (process.env.NODE_ENV === 'production') {
  const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((req, res) => res.status(404).json({ message: 'This endpoint does not exist.' }));
app.use(errorHandler);

export default app;
