"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const email_routes_1 = __importDefault(require("./routes/email.routes"));
const realtimeVoice_routes_1 = __importDefault(require("./routes/realtimeVoice.routes"));
const whatsapp_1 = require("./whatsapp");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const contact_routes_1 = __importDefault(require("./routes/contact.routes"));
const conversation_routes_1 = __importDefault(require("./routes/conversation.routes"));
const followUp_routes_1 = __importDefault(require("./routes/followUp.routes"));
const whatsappCloud_routes_1 = __importDefault(require("./routes/whatsappCloud.routes"));
const webhook_routes_1 = __importDefault(require("./routes/webhook.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const lead_routes_1 = __importDefault(require("./routes/lead.routes"));
const dashboardEmail_routes_1 = __importDefault(require("./routes/dashboardEmail.routes"));
const aiContent_routes_1 = __importDefault(require("./routes/aiContent.routes"));
const emailSequence_routes_1 = __importDefault(require("./routes/emailSequence.routes"));
const rateLimit_middleware_1 = require("./middlewares/rateLimit.middleware");
const error_middleware_1 = require("./middlewares/error.middleware");
const env_1 = require("./config/env");
const app = (0, express_1.default)();
app.set("trust proxy", 1);
const corsOptions = {
    origin: [
        "https://www.unidevsolutions.in",
        "https://unidevsolutions.in",
        "https://dashboard-unidev.vercel.app",
        "https://api.unidevsolutions.in",
        "https://www.api.unidevsolutions.in",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 204,
};
// CORS and preflight must come before everything else
app.use((0, cors_1.default)(corsOptions));
app.options("*", (0, cors_1.default)(corsOptions)); // handle all preflight OPTIONS requests
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
}));
const rateLimit = require("express-rate-limit");
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
}));
app.use((0, morgan_1.default)(env_1.env.isProduction ? "combined" : "dev"));
app.use(express_1.default.json({ limit: "1mb" }));
// Existing routes (unchanged)
app.use("/api/chat", rateLimit_middleware_1.apiRateLimiter, chat_routes_1.default);
app.use("/api/email", rateLimit_middleware_1.apiRateLimiter, email_routes_1.default);
app.use("/api/realtime-voice", rateLimit_middleware_1.apiRateLimiter, realtimeVoice_routes_1.default);
app.use("/api/whatsapp", rateLimit_middleware_1.apiRateLimiter, whatsapp_1.whatsappRoutes);
// Auth & RBAC
app.use("/api/auth", rateLimit_middleware_1.apiRateLimiter, auth_routes_1.default);
app.use("/api/users", rateLimit_middleware_1.apiRateLimiter, user_routes_1.default);
// CRM
app.use("/api/contacts", rateLimit_middleware_1.apiRateLimiter, contact_routes_1.default);
app.use("/api/conversations", rateLimit_middleware_1.apiRateLimiter, conversation_routes_1.default);
app.use("/api/follow-ups", rateLimit_middleware_1.apiRateLimiter, followUp_routes_1.default);
// WhatsApp Cloud API (Meta)
app.use("/api/whatsapp-cloud", rateLimit_middleware_1.apiRateLimiter, whatsappCloud_routes_1.default);
// Webhooks (no auth — Meta calls these directly; signature verified internally)
app.use("/api/webhooks", webhook_routes_1.default);
// Admin Dashboard
app.use("/api/dashboard", rateLimit_middleware_1.apiRateLimiter, dashboard_routes_1.default);
// Lead Management
app.use("/api/categories", rateLimit_middleware_1.apiRateLimiter, category_routes_1.default);
app.use("/api/leads", rateLimit_middleware_1.apiRateLimiter, lead_routes_1.default);
// Dashboard Email (renamed from /emails to avoid ad blocker false positives)
app.use("/api/mail", rateLimit_middleware_1.apiRateLimiter, dashboardEmail_routes_1.default);
// AI Content Generator
app.use("/api/ai", rateLimit_middleware_1.apiRateLimiter, aiContent_routes_1.default);
// Email Sequences (drip follow-up)
app.use("/api/sequences", rateLimit_middleware_1.apiRateLimiter, emailSequence_routes_1.default);
app.use(error_middleware_1.notFoundMiddleware);
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
//# sourceMappingURL=app.js.map