import express from 'express';
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, DYNAMO_TABLE } from '../config/aws.js';

const router = express.Router();

/**
 * Send a message
 * POST /api/messaging
 */
router.post('/', async (req, res) => {
  try {
    const { senderId, receiverId, text, senderRole } = req.body;

    if (!senderId || !receiverId || !text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const messageId = `MSG#${Date.now()}`;
    // We use a dual-PK strategy or a combined PK for conversations
    // For simplicity in this hackathon, we'll store under a conversation PK
    const conversationId = [senderId, receiverId].sort().join('_');

    const messageRecord = {
      pk: `CONV#${conversationId}`,
      sk: messageId,
      senderId,
      receiverId,
      senderRole,
      text,
      timestamp: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: DYNAMO_TABLE,
      Item: messageRecord
    }));

    res.status(201).json(messageRecord);
  } catch (err) {
    console.error('Send Message Error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * Get messages for a conversation
 * GET /api/messaging/:participantA/:participantB
 */
router.get('/:participantA/:participantB', async (req, res) => {
  try {
    const { participantA, participantB } = req.params;
    const conversationId = [participantA, participantB].sort().join('_');

    const response = await docClient.send(new QueryCommand({
      TableName: DYNAMO_TABLE,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": `CONV#${conversationId}`
      },
      ScanIndexForward: true // show oldest first for chat
    }));

    res.json(response.Items || []);
  } catch (err) {
    console.error('Fetch Messages Error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
