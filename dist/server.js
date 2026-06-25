"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const sequenceMailer_job_1 = require("./jobs/sequenceMailer.job");
app_1.default.set("trust proxy", 1);
process.on("uncaughtException", () => {
    process.exitCode = 1;
});
process.on("unhandledRejection", () => {
    process.exitCode = 1;
});
(0, db_1.connectDb)().then(() => {
    (0, sequenceMailer_job_1.startSequenceMailerJob)();
    app_1.default.listen(env_1.env.PORT, () => {
        if (!env_1.env.isProduction) {
            process.stdout.write(`Server listening on port ${env_1.env.PORT}\n`);
        }
    });
});
//# sourceMappingURL=server.js.map