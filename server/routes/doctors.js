import express from 'express';
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, DYNAMO_TABLE } from '../config/aws.js';

const router = express.Router();

// Get all verified/active doctors for the directory
router.get('/active', async (req, res) => {
  try {
    const response = await docClient.send(new QueryCommand({
      TableName: DYNAMO_TABLE,
      KeyConditionExpression: "pk = :pk",
      FilterExpression: "#role = :role AND #status = :status",
      ExpressionAttributeNames: { "#role": "role", "#status": "status" },
      ExpressionAttributeValues: { 
        ":pk": "USER", 
        ":role": "doctor",
        ":status": "active" 
      }
    }));
    res.json(response.Items || []);
  } catch (err) {
    console.error('Error fetching active doctors:', err);
    res.status(500).json({ error: 'Failed' });
  }
});

// Get appointments for a specific doctor
// (Currently, since we don't have a rigid appointment slot system, 
// we fetch CASES that might be assigned to this doctor or general cases they can pick up)
// For the demo, we'll fetch all 'scheduled' cases as general appointments.
router.get('/appointments/:doctorId', async (req, res) => {
  try {
    const response = await docClient.send(new QueryCommand({
      TableName: DYNAMO_TABLE,
      KeyConditionExpression: "pk = :pk",
      FilterExpression: "#status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { 
        ":pk": "CASE", 
        ":status": "scheduled" 
      }
    }));
    res.json(response.Items || []);
  } catch (err) {
    console.error('Error fetching doctor appointments:', err);
    res.status(500).json({ error: 'Failed' });
  }
});

export default router;
