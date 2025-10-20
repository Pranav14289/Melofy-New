import { BotClient } from './structures/BotClient.js';
import { logger } from './utils/logger.js';

const client = new BotClient();

client.init()
  .then(() => {
    logger.success('Main', 'Bot is now running and ready to play music!');
    logger.info('Main', `Connected to ${client.guilds.cache.size} guilds`);
  })
  .catch(error => {
    logger.error('Init', 'Failed to initialize bot', error);
    process.exit(1);
  });

process.on('unhandledRejection', (reason, promise) => {
  logger.error('UnhandledRejection', `Unhandled rejection at: ${promise}`, reason);
});

process.on('uncaughtException', (error) => {
  logger.error('UncaughtException', 'Uncaught exception', error);
  client.cleanup().finally(() => {
    process.exit(1);
  });
});

const shutdown = async () => {
  logger.warn('Shutdown', 'Received shutdown signal, cleaning up...');

  try {
    await client.cleanup();
    logger.success('Shutdown', 'Cleanup completed, shutting down gracefully.');
    process.exit(0);
  } catch (error) {
    logger.error('Shutdown', 'Error during cleanup', error);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

if (process.env.NODE_ENV !== 'production') {
  process.on('SIGUSR2', async () => {
    logger.warn('Restart', 'Received restart signal, cleaning up...');

    try {
      await client.cleanup();
      logger.success('Restart', 'Cleanup completed, restarting...');
      process.kill(process.pid, 'SIGUSR2');
    } catch (error) {
      logger.error('Restart', 'Error during cleanup', error);
      process.kill(process.pid, 'SIGUSR2');
    }
  });
}

export default client