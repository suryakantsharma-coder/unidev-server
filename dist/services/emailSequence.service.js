"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSequence = startSequence;
exports.getSequence = getSequence;
exports.listSequences = listSequences;
exports.getSequencesByLead = getSequencesByLead;
exports.listProgress = listProgress;
exports.getProgressById = getProgressById;
exports.cancelSequence = cancelSequence;
exports.processDueSteps = processDueSteps;
const env_1 = require("../config/env");
const EmailSequence_model_1 = require("../models/EmailSequence.model");
const aiContent_service_1 = require("./aiContent.service");
// Offsets: days in production, minutes in test mode
const SCHEDULE_OFFSETS = [0, 3, 7, 14, 21];
function stepLabels() {
    return env_1.env.sequenceTestMode
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
function scheduleDate(base, offset) {
    const d = new Date(base);
    if (env_1.env.sequenceTestMode) {
        d.setMinutes(d.getMinutes() + offset); // offset = minutes
    }
    else {
        d.setDate(d.getDate() + offset); // offset = days
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
async function sendViaMailtrapApi(opts) {
    const body = {
        from: { email: env_1.env.MAILTRAP_FROM },
        to: opts.to.map(e => ({ email: e })),
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
    };
    if (opts.cc?.length)
        body.cc = opts.cc.map(e => ({ email: e }));
    const res = await fetch('https://send.api.mailtrap.io/api/send', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${env_1.env.MAILTRAP_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Mailtrap API ${res.status}: ${text}`);
    }
}
async function startSequence(input) {
    const tone = input.tone ?? 'professional';
    const language = input.language ?? 'English';
    const now = new Date();
    // Pre-generate all follow-up emails using AI (steps 2-5)
    const steps = [];
    const labels = stepLabels();
    const mode = env_1.env.sequenceTestMode ? 'TEST (minutes)' : 'PRODUCTION (days)';
    process.stdout.write(`[SequenceMailer] Starting sequence in ${mode} mode\n`);
    // Step 1: mark as already sent if the caller sent it themselves (e.g. autoFollowUp)
    steps.push({
        stepNumber: 1,
        label: labels[0],
        scheduledAt: now,
        sentAt: input.initialAlreadySent ? now : undefined,
        subject: input.subject,
        body: input.body,
        status: input.initialAlreadySent ? 'sent' : 'pending',
    });
    // Steps 2-5: AI-generated follow-ups
    for (let i = 1; i < SCHEDULE_OFFSETS.length; i++) {
        const generated = await (0, aiContent_service_1.generateContent)({
            type: 'follow_up',
            tone,
            language,
            instructions: STEP_INSTRUCTIONS[i],
            leadContext: input.leadContext,
            analyze: false,
        });
        steps.push({
            stepNumber: i + 1,
            label: labels[i],
            scheduledAt: scheduleDate(now, SCHEDULE_OFFSETS[i]),
            subject: generated.subject ?? `Re: ${input.subject}`,
            body: generated.body,
            status: 'pending',
        });
    }
    const seq = await EmailSequence_model_1.EmailSequence.create({
        leadId: input.leadId,
        to: input.to,
        cc: input.cc,
        createdBy: input.createdBy,
        status: 'active',
        leadContext: input.leadContext,
        steps,
    });
    return seq;
}
async function getSequence(id) {
    return EmailSequence_model_1.EmailSequence.findById(id)
        .populate('createdBy', 'name email')
        .populate('leadId', 'title phone website')
        .lean();
}
async function listSequences(filters) {
    const query = {};
    if (filters.leadId)
        query.leadId = filters.leadId;
    if (filters.status)
        query.status = filters.status;
    if (filters.createdBy)
        query.createdBy = filters.createdBy;
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, filters.limit ?? 20);
    const skip = (page - 1) * limit;
    const [sequences, total] = await Promise.all([
        EmailSequence_model_1.EmailSequence.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        EmailSequence_model_1.EmailSequence.countDocuments(query),
    ]);
    return { sequences, total, page, limit, pages: Math.ceil(total / limit) };
}
async function getSequencesByLead(leadId) {
    return EmailSequence_model_1.EmailSequence.find({ leadId })
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .lean();
}
function buildProgress(seq) {
    const steps = seq.steps ?? [];
    const sent = steps.filter((s) => s.status === 'sent').length;
    const failed = steps.filter((s) => s.status === 'failed').length;
    const skipped = steps.filter((s) => s.status === 'skipped').length;
    const pending = steps.filter((s) => s.status === 'pending').length;
    const total = steps.length;
    const nextStep = steps.find((s) => s.status === 'pending');
    return {
        sequenceId: String(seq._id),
        status: seq.status,
        lead: seq.leadId ?? null,
        to: seq.to,
        createdBy: seq.createdBy,
        createdAt: seq.createdAt,
        progress: {
            total,
            sent,
            failed,
            skipped,
            remaining: pending,
            percentDone: total > 0 ? Math.round((sent / total) * 100) : 0,
        },
        nextEmail: nextStep
            ? { step: nextStep.stepNumber, label: nextStep.label, scheduledAt: nextStep.scheduledAt, subject: nextStep.subject }
            : null,
        steps: steps.map((s) => ({
            step: s.stepNumber,
            label: s.label,
            status: s.status,
            scheduledAt: s.scheduledAt,
            sentAt: s.sentAt ?? null,
            subject: s.subject,
            errorMessage: s.errorMessage ?? null,
        })),
    };
}
async function listProgress(filters) {
    const query = {};
    if (filters.status)
        query.status = filters.status;
    if (filters.leadId)
        query.leadId = filters.leadId;
    if (filters.createdBy)
        query.createdBy = filters.createdBy;
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, filters.limit ?? 20);
    const skip = (page - 1) * limit;
    const [sequences, total] = await Promise.all([
        EmailSequence_model_1.EmailSequence.find(query)
            .populate('leadId', 'title phone website city categoryName')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        EmailSequence_model_1.EmailSequence.countDocuments(query),
    ]);
    return {
        sequences: sequences.map(buildProgress),
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
    };
}
async function getProgressById(id) {
    const seq = await EmailSequence_model_1.EmailSequence.findById(id)
        .populate('leadId', 'title phone website city categoryName')
        .populate('createdBy', 'name email')
        .lean();
    if (!seq)
        throw Object.assign(new Error('Sequence not found'), { statusCode: 404 });
    return buildProgress(seq);
}
async function cancelSequence(id) {
    const seq = await EmailSequence_model_1.EmailSequence.findByIdAndUpdate(id, {
        status: 'cancelled',
        $set: {
            'steps.$[pending].status': 'skipped',
        },
    }, {
        arrayFilters: [{ 'pending.status': 'pending' }],
        new: true,
    });
    if (!seq)
        throw Object.assign(new Error('Sequence not found'), { statusCode: 404 });
    return seq;
}
// Called by the cron job — processes all due pending steps across active sequences.
// Uses atomic findOneAndUpdate per step to prevent double-sends across cron ticks.
async function processDueSteps() {
    const now = new Date();
    let processed = 0;
    let errors = 0;
    // Keep pulling one claimable step at a time until none remain.
    // The atomic update flips status to 'sending' before we read the data,
    // so a second cron tick won't see the same step as 'pending'.
    while (true) {
        const seq = await EmailSequence_model_1.EmailSequence.findOneAndUpdate({
            status: 'active',
            steps: { $elemMatch: { status: 'pending', scheduledAt: { $lte: now } } },
        }, { $set: { 'steps.$[due].status': 'sending' } }, {
            arrayFilters: [{ 'due.status': 'pending', 'due.scheduledAt': { $lte: now } }],
            new: true,
        });
        if (!seq)
            break; // no more claimable steps
        // Find the one step we just claimed (first 'sending' step)
        const step = seq.steps.find(s => s.status === 'sending');
        if (!step)
            break;
        let newStatus = 'sent';
        let errorMessage;
        try {
            await sendViaMailtrapApi({
                to: seq.to,
                cc: seq.cc,
                subject: step.subject,
                html: step.body,
                text: step.body.replace(/<[^>]*>/g, ''),
            });
            processed++;
        }
        catch (err) {
            newStatus = 'failed';
            errorMessage = err instanceof Error ? err.message : String(err);
            errors++;
        }
        // Write final status back for this specific step
        const updateFields = {
            'steps.$[target].status': newStatus,
            'steps.$[target].sentAt': new Date(),
        };
        if (errorMessage)
            updateFields['steps.$[target].errorMessage'] = errorMessage;
        const updated = await EmailSequence_model_1.EmailSequence.findByIdAndUpdate(seq._id, { $set: updateFields }, {
            arrayFilters: [{ 'target.status': 'sending' }],
            new: true,
        });
        // Mark sequence completed if all steps are resolved
        if (updated) {
            const allDone = updated.steps.every(s => s.status !== 'pending' && s.status !== 'sending');
            if (allDone) {
                await EmailSequence_model_1.EmailSequence.findByIdAndUpdate(updated._id, { status: 'completed' });
            }
        }
        process.stdout.write(`[SequenceMailer] step ${step.stepNumber} → ${newStatus} (seq ${seq._id})\n`);
    }
    return { processed, errors };
}
//# sourceMappingURL=emailSequence.service.js.map