import app from "./app";
import { env } from "./config/env";
import { connectDb } from "./config/db";
import { startSequenceMailerJob } from "./jobs/sequenceMailer.job";

app.set("trust proxy", 1);

process.on("uncaughtException", () => {
  process.exitCode = 1;
});

process.on("unhandledRejection", () => {
  process.exitCode = 1;
});

connectDb().then(() => {
  startSequenceMailerJob();
  app.listen(env.PORT, () => {
    if (!env.isProduction) {
      process.stdout.write(`Server listening on port ${env.PORT}\n`);
    }
  });
});
