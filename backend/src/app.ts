import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { config } from './config.js';
import { apiRouter } from './http/routes.js';
import { errorHandler } from './http/middleware.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.TRUST_PROXY);

  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigins,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
      maxAge: 600,
    }),
  );
  app.use(express.json({ limit: '256kb' }));

  app.use('/api/v1', apiRouter);
  app.use((_req, res) => res.status(404).json({ error: { code: 'not_found', message: 'Route not found.' } }));
  app.use(errorHandler);
  return app;
}
