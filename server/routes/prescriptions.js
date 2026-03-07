import express from 'express';
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, DYNAMO_TABLE } from '../config/aws.js';

const router = express.Router();

// Save a prescription
// POST /api/prescriptions
router.post('/', async (req, res) => {
  try {
    const { patientId, doctorId, doctorName, medicines, tests, notes } = req.body;

    if (!patientId || !doctorId) {
      return res.status(400).json({ error: 'patientId and doctorId are required' });
    }

    const prescriptionId = `RX#${Date.now()}`;
    const prescriptionRecord = {
      pk: `PRESCRIPTION#${patientId}`,
      sk: prescriptionId,
      patientId,
      doctorId,
      doctorName,
      medicines,
      tests,
      notes,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({
      TableName: DYNAMO_TABLE,
      Item: prescriptionRecord,
    }));

    res.status(201).json({ message: 'Prescription saved successfully', prescription: prescriptionRecord });
  } catch (err) {
    console.error('Save Prescription Error:', err);
    res.status(500).json({ error: 'Failed to save prescription', details: err.message });
  }
});

// Get prescriptions for a patient
// GET /api/prescriptions/:patientId
router.get('/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    const response = await docClient.send(new QueryCommand({
      TableName: DYNAMO_TABLE,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": `PRESCRIPTION#${patientId}`,
      },
      ScanIndexForward: false, // newest first
    }));

    res.json(response.Items || []);
  } catch (err) {
    console.error('Fetch Prescriptions Error:', err);
    res.status(500).json({ error: 'Failed to fetch prescriptions', details: err.message });
  }
});

export default router;
