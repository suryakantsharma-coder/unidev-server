"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSequenceMailerJob = startSequenceMailerJob;
const node_cron_1 = __importDefault(require("node-cron"));
const env_1 = require("../config/env");
const emailSequence_service_1 = require("../services/emailSequence.service");
let running = false;
function startSequenceMailerJob() {
    // Test mode: every minute — Production: every hour
    const cronExpr = env_1.env.sequenceTestMode ? '* * * * *' : '0 * * * *';
    const modeLabel = env_1.env.sequenceTestMode
        ? 'TEST MODE — runs every minute (offsets in minutes)'
        : 'PRODUCTION — runs every hour (offsets in days)';
    node_cron_1.default.schedule(cronExpr, async () => {
        if (running)
            return;
        running = true;
        try {
            const result = await (0, emailSequence_service_1.processDueSteps)();
            if (result.processed > 0 || result.errors > 0) {
                process.stdout.write(`[SequenceMailer] processed=${result.processed} errors=${result.errors}\n`);
            }
        }
        catch (err) {
            process.stderr.write(`[SequenceMailer] cron error: ${err}\n`);
        }
        finally {
            running = false;
        }
    });
    process.stdout.write(`[SequenceMailer] Cron started — ${modeLabel}\n`);
}
//# sourceMappingURL=sequenceMailer.job.js.map