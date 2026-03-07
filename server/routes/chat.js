import express from 'express';
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, DYNAMO_TABLE } from '../config/aws.js';

const router = express.Router();

// Save a full chat session to DynamoDB
// POST /api/chat/session
router.post('/session', async (req, res) => {
  try {
    const { patientId, messages, triageResult, sessionTitle, sessionId: existingSessionId } = req.body;

    if (!patientId || !messages || messages.length === 0) {
      return res.status(400).json({ error: 'patientId and messages are required' });
    }

    // Reuse existing sessionId (update) or create a new one (new conversation)
    const sessionId = existingSessionId || `SESSION#${Date.now()}`;
    const isNew = !existingSessionId;

    const firstUserMsg = messages.find(m => m.sender === 'user');
    const autoTitle = firstUserMsg
      ? firstUserMsg.text.slice(0, 60) + (firstUserMsg.text.length > 60 ? '…' : '')
      : `Session - ${new Date().toLocaleDateString('en-IN')}`;

    const sessionRecord = {
      pk: `CHAT#${patientId}`,
      sk: sessionId,
      patientId,
      sessionId,
      sessionTitle: sessionTitle || autoTitle,
      messages,
      triageResult: triageResult || null,
      createdAt: isNew ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    // Remove undefined fields (DynamoDB doesn't accept them)
    Object.keys(sessionRecord).forEach(k => sessionRecord[k] === undefined && delete sessionRecord[k]);

    await docClient.send(new PutCommand({
      TableName: DYNAMO_TABLE,
      Item: sessionRecord,
    }));

    // --- AUTO-CREATE CASE FOR DOCTOR ---
    // If we have a triage result, ensure this patient appears in the doctor's queue
    if (triageResult) {
      const caseId = `CASE#${patientId}`; // Use patientId as SK for case to keep 1 active case per patient easily, or SESSION id
      const caseRecord = {
        pk: 'CASE',
        sk: caseId,
        patientId,
        patientName: req.body.patientName || patientId, // Fallback to id if name not sent
        age: req.body.age,
        village: req.body.village,
        urgency: triageResult.urgency,
        specialty: triageResult.specialty,
        symptoms: messages.filter(m => m.sender === 'user').map(m => m.text),
        status: 'pending',
        sessionId: sessionId,
        submittedAt: Date.now(),
      };

      await docClient.send(new PutCommand({
        TableName: DYNAMO_TABLE,
        Item: caseRecord,
      }));
    }

    res.status(201).json({ message: 'Chat session saved successfully', sessionId, isNew, session: sessionRecord });
  } catch (err) {
    console.error('Save Chat Session Error:', err);
    res.status(500).json({ error: 'Failed to save chat session', details: err.message });
  }
});

// Get all past chat sessions for a patient
// GET /api/chat/sessions/:patientId
router.get('/sessions/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    const response = await docClient.send(new QueryCommand({
      TableName: DYNAMO_TABLE,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": `CHAT#${patientId}`,
      },
      ScanIndexForward: false, // newest first
    }));

    res.json(response.Items || []);
  } catch (err) {
    console.error('Fetch Chat Sessions Error:', err);
    res.status(500).json({ error: 'Failed to fetch chat sessions', details: err.message });
  }
});

export default router;
