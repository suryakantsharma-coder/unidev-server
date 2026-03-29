import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import chatRoutes from "./routes/chat.routes";
import emailRoutes from "./routes/email.routes";
import { whatsappRoutes } from "./whatsapp";
import { apiRateLimiter } from "./middlewares/rateLimit.middleware";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middlewares/error.middleware";
import { env } from "./config/env";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: "https://www.unidevsolutions.in",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);
app.use(morgan(env.isProduction ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));

app.use("/api/chat", apiRateLimiter, chatRoutes);
app.use("/api/email", apiRateLimiter, emailRoutes);
app.use("/api/whatsapp", apiRateLimiter, whatsappRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
