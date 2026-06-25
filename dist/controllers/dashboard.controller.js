"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = getStats;
const Contact_model_1 = require("../models/Contact.model");
const Conversation_model_1 = require("../models/Conversation.model");
const Message_model_1 = require("../models/Message.model");
const followUp_service_1 = require("../services/followUp.service");
async function getStats(req, res, next) {
    try {
        const [totalContacts, totalConversations, activeConversations, followUpsDueToday, messagesSent, messagesReceived,] = await Promise.all([
            Contact_model_1.Contact.countDocuments(),
            Conversation_model_1.Conversation.countDocuments(),
            Conversation_model_1.Conversation.countDocuments({ status: 'open' }),
            (0, followUp_service_1.countDueToday)(),
            Message_model_1.Message.countDocuments({ direction: 'outbound' }),
            Message_model_1.Message.countDocuments({ direction: 'inbound' }),
        ]);
        res.json({
            success: true,
            data: {
                totalContacts,
                totalConversations,
                activeConversations,
                followUpsDueToday,
                messagesSent,
                messagesReceived,
            },
        });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=dashboard.controller.js.map