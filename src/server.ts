import app from './app';
import { env } from './config/env';

process.on('uncaughtException', () => {
  process.exitCode = 1;
});

process.on('unhandledRejection', () => {
  process.exitCode = 1;
});

app.listen(env.PORT, () => {
  if (!env.isProduction) {
    process.stdout.write(`Server listening on port ${env.PORT}\n`);
  }
});
