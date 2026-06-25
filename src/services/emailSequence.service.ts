import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { EmailSequence, IEmailSequence } from '../models/EmailSequence.model';
import { generateContent, LeadContext, ContentTone } from './aiContent.service';

// Offsets: days in production, minutes in test mode
const SCHEDULE_OFFSETS = [0, 3, 7, 14, 21] as const;

function stepLabels(): string[] {
  return env.sequenceTestMode
    ? [
        'Initial Email',
        'Follow-up 1 (3 min)',
        'Follow-up 2 (7 min)',
        'Follow-up 3 (14 min)',
        'Final Follow-up (21 min)',
      ]
    : [
        'Initial Email',
        'Follow-up 1 (Day 3)',
        'Follow-up 2 (Day 7)',
        'Follow-up 3 (Day 14)',
        'Final Follow-up (Day 21)',
      ];
}

function scheduleDate(base: Date, offset: number): Date {
  const d = new Date(base);
  if (env.sequenceTestMode) {
    d.setMinutes(d.getMinutes() + offset); // offset = minutes
  } else {
    d.setDate(d.getDate() + offset);       // offset = days
  }
  return d;
}

const STEP_INSTRUCTIONS = [
  '', // Initial — no extra instruction, caller provides subject+body
  'This is a gentle follow-up to the initial email sent 3 days ago. Keep it very short (2-3 lines). Reference that you reached out and offer to answer any questions.',
  'Second follow-up. The prospect has not responded. Add a new angle or a brief case study mention. Keep it under 3 sentences.',
  'Third follow-up. Be honest — mention this is your third attempt and you do not want to be annoying. Offer to step back if now is not the right time.',
  'Final follow-up. Let them know this is your last email. Keep it ultra short. Leave the door open for future contact.',
];


function mailtrapTransport() {
  return nodemailer.createTransport({
    host: env.MAILTRAP_HOST,
    port: env.MAILTRAP_PORT,
    auth: { user: env.MAILTRAP_USER, pass: env.MAILTRAP_PASS },
  });
}

export interface StartSequenceInput {
  leadId?:           string;
  to:                string[];
  cc?:               string[];
  subject:           string;
  body:              string;
  tone?:             ContentTone;
  language?:         string;
  leadContext:       LeadContext;
  createdBy:         string;
  analyze?:          boolean;
  initialAlreadySent?: boolean; // true when caller already sent the first email
}

export async function startSequence(input: StartSequenceInput) {
  const tone     = input.tone     ?? 'professional';
  const language = input.language ?? 'English';
  const now      = new Date();

  // Pre-generate all follow-up emails using AI (steps 2-5)
  const steps = [];

  const labels = stepLabels();
  const mode   = env.sequenceTestMode ? 'TEST (minutes)' : 'PRODUCTION (days)';
  process.stdout.write(`[SequenceMailer] Starting sequence in ${mode} mode\n`);

  // Step 1: mark as already sent if the caller sent it themselves (e.g. autoFollowUp)
  steps.push({
    stepNumber:  1,
    label:       labels[0],
    scheduledAt: now,
    sentAt:      input.initialAlreadySent ? now : undefined,
    subject:     input.subject,
    body:        input.body,
    status:      input.initialAlreadySent ? ('sent' as const) : ('pending' as const),
  });

  // Steps 2-5: AI-generated follow-ups
  for (let i = 1; i < SCHEDULE_OFFSETS.length; i++) {
    const generated = await generateContent({
      type:         'follow_up',
      tone,
      language,
      instructions: STEP_INSTRUCTIONS[i],
      leadContext:  input.leadContext,
      analyze:      false,
    });

    steps.push({
      stepNumber:  i + 1,
      label:       labels[i],
      scheduledAt: scheduleDate(now, SCHEDULE_OFFSETS[i]),
      subject:     generated.subject ?? `Re: ${input.subject}`,
      body:        generated.body,
      status:      'pending' as const,
    });
  }

  const seq = await EmailSequence.create({
    leadId:      input.leadId,
    to:          input.to,
    cc:          input.cc,
    createdBy:   input.createdBy,
    status:      'active',
    leadContext: input.leadContext as Record<string, unknown>,
    steps,
  });

  return seq;
}

export async function getSequence(id: string) {
  return EmailSequence.findById(id)
    .populate('createdBy', 'name email')
    .populate('leadId', 'title phone website')
    .lean();
}

export async function listSequences(filters: {
  leadId?: string;
  status?: string;
  createdBy?: string;
  page?: number;
  limit?: number;
}) {
  const query: Record<string, unknown> = {};
  if (filters.leadId)    query.leadId    = filters.leadId;
  if (filters.status)    query.status    = filters.status;
  if (filters.createdBy) query.createdBy = filters.createdBy;

  const page  = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, filters.limit ?? 20);
  const skip  = (page - 1) * limit;

  const [sequences, total] = await Promise.all([
    EmailSequence.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    EmailSequence.countDocuments(query),
  ]);

  return { sequences, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getSequencesByLead(leadId: string) {
  return EmailSequence.find({ leadId })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();
}

function buildProgress(seq: any) {
  const steps     = seq.steps ?? [];
  const sent      = steps.filter((s: any) => s.status === 'sent').length;
  const failed    = steps.filter((s: any) => s.status === 'failed').length;
  const skipped   = steps.filter((s: any) => s.status === 'skipped').length;
  const pending   = steps.filter((s: any) => s.status === 'pending').length;
  const total     = steps.length;
  const nextStep  = steps.find((s: any) => s.status === 'pending');

  return {
    sequenceId:     String(seq._id),
    status:         seq.status,
    lead:           seq.leadId ?? null,
    to:             seq.to,
    createdBy:      seq.createdBy,
    createdAt:      seq.createdAt,
    progress: {
      total,
      sent,
      failed,
      skipped,
      remaining:    pending,
      percentDone:  total > 0 ? Math.round((sent / total) * 100) : 0,
    },
    nextEmail: nextStep
      ? { step: nextStep.stepNumber, label: nextStep.label, scheduledAt: nextStep.scheduledAt, subject: nextStep.subject }
      : null,
    steps: steps.map((s: any) => ({
      step:        s.stepNumber,
      label:       s.label,
      status:      s.status,
      scheduledAt: s.scheduledAt,
      sentAt:      s.sentAt ?? null,
      subject:     s.subject,
      errorMessage: s.errorMessage ?? null,
    })),
  };
}

export async function listProgress(filters: {
  status?:    string;
  leadId?:    string;
  createdBy?: string;
  page?:      number;
  limit?:     number;
}) {
  const query: Record<string, unknown> = {};
  if (filters.status)    query.status    = filters.status;
  if (filters.leadId)    query.leadId    = filters.leadId;
  if (filters.createdBy) query.createdBy = filters.createdBy;

  const page  = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, filters.limit ?? 20);
  const skip  = (page - 1) * limit;

  const [sequences, total] = await Promise.all([
    EmailSequence.find(query)
      .populate('leadId', 'title phone website city categoryName')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    EmailSequence.countDocuments(query),
  ]);

  return {
    sequences: sequences.map(buildProgress),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

export async function getProgressById(id: string) {
  const seq = await EmailSequence.findById(id)
    .populate('leadId', 'title phone website city categoryName')
    .populate('createdBy', 'name email')
    .lean();
  if (!seq) throw Object.assign(new Error('Sequence not found'), { statusCode: 404 });
  return buildProgress(seq);
}

export async function cancelSequence(id: string) {
  const seq = await EmailSequence.findByIdAndUpdate(
    id,
    {
      status: 'cancelled',
      $set: {
        'steps.$[pending].status': 'skipped',
      },
    },
    {
      arrayFilters: [{ 'pending.status': 'pending' }],
      new: true,
    },
  );
  if (!seq) throw Object.assign(new Error('Sequence not found'), { statusCode: 404 });
  return seq;
}

// Called by the cron job — processes all due pending steps across active sequences.
// Uses atomic findOneAndUpdate per step to prevent double-sends across cron ticks.
export async function processDueSteps(): Promise<{ processed: number; errors: number }> {
  const now       = new Date();
  const transport = mailtrapTransport();
  let processed   = 0;
  let errors      = 0;

  // Keep pulling one claimable step at a time until none remain.
  // The atomic update flips status to 'sending' before we read the data,
  // so a second cron tick won't see the same step as 'pending'.
  while (true) {
    const seq = await EmailSequence.findOneAndUpdate(
      {
        status: 'active',
        steps: { $elemMatch: { status: 'pending', scheduledAt: { $lte: now } } },
      },
      { $set: { 'steps.$[due].status': 'sending' } },
      {
        arrayFilters: [{ 'due.status': 'pending', 'due.scheduledAt': { $lte: now } }],
        new: true,
      },
    );

    if (!seq) break; // no more claimable steps

    // Find the one step we just claimed (first 'sending' step)
    const step = seq.steps.find(s => (s as any).status === 'sending');
    if (!step) break;

    let newStatus: 'sent' | 'failed' = 'sent';
    let errorMessage: string | undefined;

    try {
      await transport.sendMail({
        from:    env.MAILTRAP_FROM,
        to:      seq.to.join(', '),
        cc:      seq.cc?.join(', '),
        subject: step.subject,
        html:    step.body,
        text:    step.body.replace(/<[^>]*>/g, ''),
      });
      processed++;
    } catch (err) {
      newStatus    = 'failed';
      errorMessage = err instanceof Error ? err.message : String(err);
      errors++;
    }

    // Write final status back for this specific step
    const updateFields: Record<string, unknown> = {
      'steps.$[target].status': newStatus,
      'steps.$[target].sentAt': new Date(),
    };
    if (errorMessage) updateFields['steps.$[target].errorMessage'] = errorMessage;

    const updated = await EmailSequence.findByIdAndUpdate(
      seq._id,
      { $set: updateFields },
      {
        arrayFilters: [{ 'target.status': 'sending' }],
        new: true,
      },
    );

    // Mark sequence completed if all steps are resolved
    if (updated) {
      const allDone = updated.steps.every(s => s.status !== 'pending' && (s as any).status !== 'sending');
      if (allDone) {
        await EmailSequence.findByIdAndUpdate(updated._id, { status: 'completed' });
      }
    }

    process.stdout.write(
      `[SequenceMailer] step ${step.stepNumber} → ${newStatus} (seq ${seq._id})\n`,
    );
  }

  return { processed, errors };
}
