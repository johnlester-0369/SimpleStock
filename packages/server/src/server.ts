import { env } from '@/config/env.config.js';
import { logger } from '@/utils/logger.js';
import app from '@/app.js';

const PORT = env.PORT;

// === Start Server ===
app.listen(PORT, () => {
  logger.info('🚀 Server Started Successfully', {
    port: PORT,
    environment: env.NODE_ENV,
    logLevel: env.LOG_LEVEL,
  });
});
