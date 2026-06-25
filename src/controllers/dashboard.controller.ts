import { Request, Response, NextFunction } from 'express';
import { Contact } from '../models/Contact.model';
import { Conversation } from '../models/Conversation.model';
import { Message } from '../models/Message.model';
import { countDueToday } from '../services/followUp.service';

export async function getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [
      totalContacts,
      totalConversations,
      activeConversations,
      followUpsDueToday,
      messagesSent,
      messagesReceived,
    ] = await Promise.all([
      Contact.countDocuments(),
      Conversation.countDocuments(),
      Conversation.countDocuments({ status: 'open' }),
      countDueToday(),
      Message.countDocuments({ direction: 'outbound' }),
      Message.countDocuments({ direction: 'inbound' }),
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
  } catch (err) {
    next(err);
  }
}
