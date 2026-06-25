import cron from 'node-cron';
import { env } from '../config/env';
import { processDueSteps } from '../services/emailSequence.service';

let running = false;

export function startSequenceMailerJob() {
  // Test mode: every minute — Production: every hour
  const cronExpr = env.sequenceTestMode ? '* * * * *' : '0 * * * *';
  const modeLabel = env.sequenceTestMode
    ? 'TEST MODE — runs every minute (offsets in minutes)'
    : 'PRODUCTION — runs every hour (offsets in days)';

  cron.schedule(cronExpr, async () => {
    if (running) return;
    running = true;
    try {
      const result = await processDueSteps();
      if (result.processed > 0 || result.errors > 0) {
        process.stdout.write(
          `[SequenceMailer] processed=${result.processed} errors=${result.errors}\n`,
        );
      }
    } catch (err) {
      process.stderr.write(`[SequenceMailer] cron error: ${err}\n`);
    } finally {
      running = false;
    }
  });

  process.stdout.write(`[SequenceMailer] Cron started — ${modeLabel}\n`);
}
