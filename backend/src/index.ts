import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './config/env';
import { corsOptions } from './config/cors';
import { generalLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';
import { logger } from './lib/logger';
import { startScheduler } from './jobs/scheduler';

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(generalLimiter);

// Static files for uploads
app.use('/uploads', express.static(env.UPLOAD_DIR));

// API routes
app.use('/api', routes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
  logger.info(`🚀 عالم الدراسة API running on port ${env.PORT}`);
  logger.info(`📚 Environment: ${env.NODE_ENV}`);

  // Start scheduled jobs
  if (env.NODE_ENV !== 'test') {
    startScheduler();
  }
});

export default app;
