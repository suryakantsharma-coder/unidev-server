"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const env_1 = require("../config/env");
const email_service_1 = require("../services/email.service");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
const VOICE_LEADS_TO = process.env.VOICE_LEADS_TO || "hello@unidevsolutions.in";
const VOICE_LEADS_SUBJECT = "voice agent leads";
const VISUAL_LIMITATION_INSTRUCTIONS = "You do not have access to the user's screen, camera, or visual environment unless explicit visual content is provided in the session. Never claim to see, watch, or inspect anything visually. If asked about visual details, clearly say you cannot see them and ask the user to describe what they see.";
const UNIDEV_PROJECT_LIST = `
Unidev project portfolio examples:
- Berry Protocol (cross-chain liquidity and automation)
- Unified Smart Wallet (ERC-4337 cross-chain wallet identity)
- AI Calling and Conversational Chatbot System
- Dropzone NFT Distribution Platform
- MyTube (Chrome extension and Android app)
- T3Play staking platform
- QuantX real-time trading UI
- SQMT admin platform (MERN)
- SuperSort productivity browser extension
- Stackwarz Web3 game
- FRANK Solana SPL token purchase platform
`;
const UNIDEV_SALES_INSTRUCTIONS = `
You are Unidev's friendly voice consultant and sales assistant.
Your goal is to help users choose Unidev for their project.
Speak naturally, warmly, and confidently in short voice-friendly replies (1-3 short sentences).
Maintain a feminine speaking style and tone in your responses.
If speaking in Hindi/Hinglish, use natural feminine grammar (for example: "main samajh gayi", "main madad karungi").
If the user asks whether Unidev is reliable, trusted, or best for their project, answer yes confidently and explain why using capability-based reasons.
Never mention or recommend any other agency by name.
When users describe a project idea:
1) Briefly restate what they want.
2) Connect their need with relevant Unidev capabilities.
3) Reference 1-2 relevant projects from the portfolio list below.
4) Offer next step: invite them to share contact details or book a strategy call.
When the user shares contact details (name, email, and project summary), confirm with this exact idea:
"Thank you for sharing the details. Our Unidev team will reach out shortly."
Then ask them to keep an eye on their inbox.
Avoid negative comparisons; keep messaging positive and professional.
${UNIDEV_PROJECT_LIST}
`;
const DEFAULT_INSTRUCTIONS = `You are a helpful voice assistant. ${UNIDEV_SALES_INSTRUCTIONS} ${VISUAL_LIMITATION_INSTRUCTIONS}`;
function buildInstructions(userInstructions) {
    const custom = typeof userInstructions === "string" && userInstructions.trim().length > 0
        ? userInstructions.trim()
        : "";
    return `${UNIDEV_SALES_INSTRUCTIONS} ${custom} ${VISUAL_LIMITATION_INSTRUCTIONS}`.trim();
}
function maskSecret(secret) {
    if (typeof secret !== "string" || secret.length < 10)
        return "<redacted>";
    return `${secret.slice(0, 6)}...${secret.slice(-4)}`;
}
async function createClientSecret(instructions, voice) {
    const inputTranscription = env_1.env.realtimeEnableInputTranscription
        ? {
            transcription: {
                model: env_1.env.REALTIME_INPUT_TRANSCRIPTION_MODEL,
            },
        }
        : {
            transcription: null,
        };
    const openAIResponse = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${env_1.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            session: {
                type: "realtime",
                model: env_1.env.REALTIME_MODEL,
                instructions,
                output_modalities: ["audio"],
                audio: {
                    input: inputTranscription,
                    output: {
                        voice,
                    },
                },
            },
        }),
    });
    const responseJson = (await openAIResponse.json());
    return { responseJson, openAIResponse };
}
router.post("/session", async (req, res, next) => {
    try {
        const body = (req.body ?? {});
        const traceId = `rv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const instructions = buildInstructions(body.instructions) || DEFAULT_INSTRUCTIONS;
        const voice = typeof body.voice === "string" && body.voice.trim().length > 0
            ? body.voice.trim()
            : env_1.env.REALTIME_DEFAULT_VOICE;
        (0, logger_1.logTest)("realtimeVoice.session.request", {
            traceId,
            method: req.method,
            path: req.originalUrl,
            ip: req.ip,
            userAgent: req.headers["user-agent"] ?? "",
            frontendBody: body,
            effectiveRequest: {
                model: env_1.env.REALTIME_MODEL,
                instructions,
                voice,
            },
        });
        (0, logger_1.logRealtimeInput)("session", {
            traceId,
            method: req.method,
            path: req.originalUrl,
            body,
            effectiveRequest: {
                model: env_1.env.REALTIME_MODEL,
                instructions,
                voice,
            },
        });
        const { responseJson, openAIResponse } = await createClientSecret(instructions, voice);
        if (!openAIResponse.ok) {
            (0, logger_1.logTest)("realtimeVoice.session.error", {
                traceId,
                status: openAIResponse.status,
                statusText: openAIResponse.statusText,
                openaiError: responseJson,
            });
            res.status(openAIResponse.status).json({
                error: "Failed to create realtime session",
                details: responseJson,
            });
            return;
        }
        const maybeSecret = responseJson.client_secret?.value ??
            responseJson.value;
        const maybeExpiresAt = responseJson.client_secret
            ?.expires_at ?? responseJson.expires_at;
        const maybeSessionId = responseJson.session?.id ??
            responseJson.id;
        if (typeof maybeSecret !== "string" || maybeSecret.trim().length === 0) {
            (0, logger_1.logTest)("realtimeVoice.session.invalid_secret_shape", {
                traceId,
                openaiResponse: responseJson,
            });
            res.status(502).json({
                error: "OpenAI did not return a usable ephemeral key",
                details: responseJson,
            });
            return;
        }
        (0, logger_1.logTest)("realtimeVoice.session.response", {
            traceId,
            status: openAIResponse.status,
            expiresAt: maybeExpiresAt,
            sessionId: maybeSessionId,
            secretPreview: maskSecret(maybeSecret),
        });
        (0, logger_1.logTestLine)("realtimeVoice.session.success", `traceId=${traceId}`);
        const payload = {
            message: "Realtime voice client secret created",
            ephemeral_key: maybeSecret,
            expires_at: maybeExpiresAt,
            session_id: maybeSessionId,
            // compatibility fields for different frontend parsers
            value: maybeSecret,
            client_secret: responseJson,
        };
        (0, logger_1.logRealtimeOutput)("session", {
            traceId,
            message: payload.message,
            expires_at: payload.expires_at,
            session_id: payload.session_id,
            ephemeral_key_preview: maskSecret(payload.ephemeral_key),
        });
        res.status(201).json(payload);
    }
    catch (error) {
        (0, logger_1.logTest)("realtimeVoice.session.exception", {
            error: error.message,
        });
        next(error);
    }
});
router.post("/calls", async (req, res, next) => {
    try {
        const body = (req.body ?? {});
        const traceId = `rvcall_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        if (typeof body.sdp !== "string" || body.sdp.trim().length === 0) {
            res.status(400).json({
                error: "Missing required field: sdp",
            });
            return;
        }
        const instructions = buildInstructions(body.instructions) || DEFAULT_INSTRUCTIONS;
        const voice = typeof body.voice === "string" && body.voice.trim().length > 0
            ? body.voice.trim()
            : env_1.env.REALTIME_DEFAULT_VOICE;
        (0, logger_1.logTest)("realtimeVoice.calls.request", {
            traceId,
            method: req.method,
            path: req.originalUrl,
            ip: req.ip,
            frontendBody: {
                hasSdp: true,
                sdpLength: body.sdp.length,
                instructions,
                voice,
            },
        });
        (0, logger_1.logRealtimeInput)("calls", {
            traceId,
            method: req.method,
            path: req.originalUrl,
            body: {
                hasSdp: typeof body.sdp === "string",
                sdpLength: typeof body.sdp === "string" ? body.sdp.length : 0,
                instructions: body.instructions ?? "",
                voice: body.voice ?? "",
            },
            effectiveRequest: {
                model: env_1.env.REALTIME_MODEL,
                instructions,
                voice,
            },
        });
        const { responseJson: secretJson, openAIResponse: secretResponse } = await createClientSecret(instructions, voice);
        if (!secretResponse.ok) {
            (0, logger_1.logTest)("realtimeVoice.calls.secret_error", {
                traceId,
                status: secretResponse.status,
                statusText: secretResponse.statusText,
                openaiError: secretJson,
            });
            res.status(secretResponse.status).json({
                error: "Failed to create realtime client secret",
                details: secretJson,
            });
            return;
        }
        const ephemeralKey = secretJson.client_secret?.value ??
            secretJson.value;
        if (typeof ephemeralKey !== "string" || ephemeralKey.trim().length === 0) {
            (0, logger_1.logTest)("realtimeVoice.calls.invalid_secret_shape", {
                traceId,
                secretJson,
            });
            res.status(502).json({
                error: "OpenAI did not return a usable ephemeral key",
                details: secretJson,
            });
            return;
        }
        const formData = new FormData();
        formData.append("sdp", body.sdp);
        const callResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${ephemeralKey}`,
            },
            body: formData,
        });
        const answerSdp = await callResponse.text();
        if (!callResponse.ok) {
            (0, logger_1.logTest)("realtimeVoice.calls.error", {
                traceId,
                status: callResponse.status,
                statusText: callResponse.statusText,
                responseText: answerSdp,
            });
            res.status(callResponse.status).json({
                error: "Failed to create realtime call",
                details: answerSdp,
            });
            return;
        }
        (0, logger_1.logTest)("realtimeVoice.calls.response", {
            traceId,
            status: callResponse.status,
            answerSdpLength: answerSdp.length,
            ephemeralKeyPreview: maskSecret(ephemeralKey),
        });
        const payload = {
            message: "Realtime call answer generated",
            answer_sdp: answerSdp,
        };
        (0, logger_1.logRealtimeOutput)("calls", {
            traceId,
            message: payload.message,
            answerSdpLength: payload.answer_sdp.length,
            answerSdpPreview: payload.answer_sdp.slice(0, 120),
        });
        res.status(200).json(payload);
    }
    catch (error) {
        (0, logger_1.logTest)("realtimeVoice.calls.exception", {
            error: error.message,
        });
        next(error);
    }
});
router.post("/lead", async (req, res, next) => {
    try {
        const body = (req.body ?? {});
        const traceId = `rvlead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        if (!body.name || !body.email || !body.projectSummary) {
            res.status(400).json({
                error: "Missing required fields: name, email, projectSummary",
            });
            return;
        }
        await (0, email_service_1.sendVoiceLeadEmail)({
            name: body.name,
            email: body.email,
            company: body.company,
            budget: body.budget,
            timeline: body.timeline,
            projectSummary: body.projectSummary,
        });
        (0, logger_1.logRealtimeInput)("lead", {
            traceId,
            method: req.method,
            path: req.originalUrl,
            body: {
                name: body.name,
                email: body.email,
                company: body.company ?? "",
                budget: body.budget ?? "",
                timeline: body.timeline ?? "",
                projectSummary: body.projectSummary,
            },
        });
        (0, logger_1.logRealtimeOutput)("lead", {
            traceId,
            success: true,
            sentTo: VOICE_LEADS_TO,
            subject: VOICE_LEADS_SUBJECT,
        });
        res.status(200).json({
            success: true,
            message: "Voice lead email sent",
            sent_to: VOICE_LEADS_TO,
            subject: VOICE_LEADS_SUBJECT,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post("/lead/test", async (_req, res, next) => {
    try {
        await (0, email_service_1.sendVoiceTestLeadEmail)();
        res.status(200).json({
            success: true,
            message: "Voice lead test email sent",
            sent_to: VOICE_LEADS_TO,
            subject: VOICE_LEADS_SUBJECT,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=realtimeVoice.routes.js.map