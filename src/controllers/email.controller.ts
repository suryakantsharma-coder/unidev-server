import { Request, Response, NextFunction } from "express";
import { sendLeadEmail, sendTestLeadEmail } from "../services/email.service";
import { ApiSuccessResponse, ApiErrorResponse } from "../types/chat.types";
import { ValidatedLeadBody } from "../middlewares/validate.middleware";

export async function sendTestEmail(
  _req: Request,
  res: Response<ApiSuccessResponse | ApiErrorResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    await sendTestLeadEmail();
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function sendLeadFromEndpoint(
  req: Request<object, ApiSuccessResponse | ApiErrorResponse, ValidatedLeadBody>,
  res: Response<ApiSuccessResponse | ApiErrorResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const lead = req.body;
    await sendLeadEmail(lead);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}
