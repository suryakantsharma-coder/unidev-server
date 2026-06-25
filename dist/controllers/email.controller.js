"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTestEmail = sendTestEmail;
exports.sendLeadFromEndpoint = sendLeadFromEndpoint;
const email_service_1 = require("../services/email.service");
async function sendTestEmail(_req, res, next) {
    try {
        await (0, email_service_1.sendTestLeadEmail)();
        res.status(200).json({ success: true });
    }
    catch (err) {
        next(err);
    }
}
async function sendLeadFromEndpoint(req, res, next) {
    try {
        const lead = req.body;
        await (0, email_service_1.sendLeadEmail)(lead);
        res.status(200).json({ success: true });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=email.controller.js.map