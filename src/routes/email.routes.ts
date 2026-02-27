import { Router } from "express";
import { sendTestEmail, sendLeadFromEndpoint } from "../controllers/email.controller";
import { validateLeadBody } from "../middlewares/validate.middleware";

const router = Router();

/** POST /api/email/test – send a test email (dummy lead) to EMAIL_TO */
router.post("/test", sendTestEmail);

/** POST /api/email/lead – send a lead email with body { name, email, projectSummary, ... } */
router.post("/lead", validateLeadBody, sendLeadFromEndpoint);

export default router;
