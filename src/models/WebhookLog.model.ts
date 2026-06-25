import { Document, Schema, model } from 'mongoose';

export interface IWebhookLog extends Document {
  source: string;
  event?: string;
  payload: Record<string, unknown>;
  receivedAt: Date;
  processed: boolean;
  processingError?: string;
}

const webhookLogSchema = new Schema<IWebhookLog>(
  {
    source: { type: String, required: true, index: true },
    event: { type: String },
    payload: { type: Schema.Types.Mixed, required: true },
    receivedAt: { type: Date, default: Date.now, index: true },
    processed: { type: Boolean, default: false },
    processingError: { type: String },
  },
  {
    // No updatedAt needed — logs are immutable
    timestamps: { createdAt: false, updatedAt: false },
  }
);

// Auto-expire logs after 90 days
webhookLogSchema.index({ receivedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export const WebhookLog = model<IWebhookLog>('WebhookLog', webhookLogSchema);
