import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import imageRoutes from './routes/imageRoutes.js';
import postRoutes from './routes/postRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Aura Gallery API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      posts: '/api/v1/posts',
      images: '/api/v1/images',
    },
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy' });
});

app.use('/api/v1/images', imageRoutes);
app.use('/api/v1/posts', postRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
