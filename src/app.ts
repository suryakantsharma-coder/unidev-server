import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import chatRoutes from "./routes/chat.routes";
import emailRoutes from "./routes/email.routes";
import realtimeVoiceRoutes from "./routes/realtimeVoice.routes";
import { whatsappRoutes } from "./whatsapp";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import contactRoutes from "./routes/contact.routes";
import conversationRoutes from "./routes/conversation.routes";
import followUpRoutes from "./routes/followUp.routes";
import whatsappCloudRoutes from "./routes/whatsappCloud.routes";
import webhookRoutes from "./routes/webhook.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import categoryRoutes from "./routes/category.routes";
import leadRoutes from "./routes/lead.routes";
import dashboardEmailRoutes from "./routes/dashboardEmail.routes";
import aiContentRoutes from "./routes/aiContent.routes";
import emailSequenceRoutes from "./routes/emailSequence.routes";
import { apiRateLimiter } from "./middlewares/rateLimit.middleware";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middlewares/error.middleware";
import { env } from "./config/env";

const app = express();

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
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle all preflight OPTIONS requests

app.use(
  helmet({
    crossOriginResourcePolicy:   { policy: "cross-origin" },
    crossOriginOpenerPolicy:     false,
    crossOriginEmbedderPolicy:   false,
  }),
);

const rateLimit = require("express-rate-limit");
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);
app.use(morgan(env.isProduction ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));

// Existing routes (unchanged)
app.use("/api/chat", apiRateLimiter, chatRoutes);
app.use("/api/email", apiRateLimiter, emailRoutes);
app.use("/api/realtime-voice", apiRateLimiter, realtimeVoiceRoutes);
app.use("/api/whatsapp", apiRateLimiter, whatsappRoutes);

// Auth & RBAC
app.use("/api/auth", apiRateLimiter, authRoutes);
app.use("/api/users", apiRateLimiter, userRoutes);

// CRM
app.use("/api/contacts", apiRateLimiter, contactRoutes);
app.use("/api/conversations", apiRateLimiter, conversationRoutes);
app.use("/api/follow-ups", apiRateLimiter, followUpRoutes);

// WhatsApp Cloud API (Meta)
app.use("/api/whatsapp-cloud", apiRateLimiter, whatsappCloudRoutes);

// Webhooks (no auth — Meta calls these directly; signature verified internally)
app.use("/api/webhooks", webhookRoutes);

// Admin Dashboard
app.use("/api/dashboard", apiRateLimiter, dashboardRoutes);

// Lead Management
app.use("/api/categories", apiRateLimiter, categoryRoutes);
app.use("/api/leads", apiRateLimiter, leadRoutes);

// Dashboard Email
app.use("/api/emails", apiRateLimiter, dashboardEmailRoutes);

// AI Content Generator
app.use("/api/ai", apiRateLimiter, aiContentRoutes);

// Email Sequences (drip follow-up)
app.use("/api/email-sequences", apiRateLimiter, emailSequenceRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
