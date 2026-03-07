import express from 'express';
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, DYNAMO_TABLE } from '../config/aws.js';

const router = express.Router();

// Create case
router.post('/', async (req, res) => {
  try {
    const caseItem = {
      pk: 'CASE',
      sk: `CASE#${Date.now()}`,
      ...req.body,
      status: 'open',
      submittedAt: Date.now()
    };
    await docClient.send(new PutCommand({ TableName: DYNAMO_TABLE, Item: caseItem }));
    res.status(201).json(caseItem);
  } catch (err) {
    console.error('Case Error:', err);
    res.status(500).json({ error: 'Failed' });
  }
});

// Get cases
router.get('/', async (req, res) => {
  try {
    const response = await docClient.send(new QueryCommand({
      TableName: DYNAMO_TABLE,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": "CASE" }
    }));
    res.json(response.Items || []);
  } catch (err) {
    console.error('Fetch Error:', err);
    res.status(500).json({ error: 'Failed' });
  }
});

// Get cases for a specific patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const response = await docClient.send(new QueryCommand({
      TableName: DYNAMO_TABLE,
      KeyConditionExpression: "pk = :pk",
      FilterExpression: "patientId = :patientId",
      ExpressionAttributeValues: { 
        ":pk": "CASE",
        ":patientId": patientId
      }
    }));
    res.json(response.Items || []);
  } catch (err) {
    console.error('Fetch Patient Cases Error:', err);
    res.status(500).json({ error: 'Failed' });
  }
});

export default router;
