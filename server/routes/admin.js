import express from 'express';
import { PutCommand, QueryCommand, UpdateCommand, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, DYNAMO_TABLE } from '../config/aws.js';

const router = express.Router();

// Log an administrative action
const logAction = async (action, details) => {
  try {
    const logEntry = {
      pk: 'LOG',
      sk: `LOG#${Date.now()}`,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    await docClient.send(new PutCommand({ TableName: DYNAMO_TABLE, Item: logEntry }));
  } catch (err) {
    console.error('Logging Error:', err);
  }
};

// Get all pending doctors
router.get('/doctors/pending', async (req, res) => {
  try {
    const response = await docClient.send(new QueryCommand({
      TableName: DYNAMO_TABLE,
      KeyConditionExpression: "pk = :pk",
      FilterExpression: "#status = :status AND #role = :role",
      ExpressionAttributeNames: { "#status": "status", "#role": "role" },
      ExpressionAttributeValues: { ":pk": "USER", ":status": "pending", ":role": "doctor" }
    }));
    res.json(response.Items || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// Verify/Reject a doctor
router.post('/doctors/verify', async (req, res) => {
  try {
    const { doctorId, status } = req.body;
    await docClient.send(new UpdateCommand({
      TableName: DYNAMO_TABLE,
      Key: { pk: 'USER', sk: doctorId },
      UpdateExpression: "set #status = :status, verifiedAt = :date",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": status, ":date": new Date().toISOString() }
    }));
    
    await logAction('VERIFY_DOCTOR', { doctorId, status });
    res.json({ message: `Doctor ${status} successfully` });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// Get Emergency Feed (Live High-Urgency Cases)
router.get('/emergency-feed', async (req, res) => {
  try {
    const response = await docClient.send(new QueryCommand({
      TableName: DYNAMO_TABLE,
      KeyConditionExpression: "pk = :pk",
      FilterExpression: "urgency = :urgency AND #status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":pk": "CASE",
        ":urgency": "EMERGENCY",
        ":status": "open"
      }
    }));
    res.json(response.Items || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// Get Audit Logs
router.get('/logs', async (req, res) => {
  try {
    const response = await docClient.send(new QueryCommand({
      TableName: DYNAMO_TABLE,
      KeyConditionExpression: "pk = :pk",
      ScanIndexForward: false, // Latest first
      ExpressionAttributeValues: { ":pk": "LOG" }
    }));
    res.json(response.Items || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// Manage Global Config
router.get('/config', async (req, res) => {
  try {
    const response = await docClient.send(new QueryCommand({
      TableName: DYNAMO_TABLE,
      KeyConditionExpression: "pk = :pk AND sk = :sk",
      ExpressionAttributeValues: { ":pk": "CONFIG", ":sk": "GLOBAL" }
    }));
    res.json(response.Items?.[0] || { maintenanceMode: false, autoApprove: false });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

router.post('/config', async (req, res) => {
  try {
    const config = { pk: 'CONFIG', sk: 'GLOBAL', ...req.body, updatedAt: new Date().toISOString() };
    await docClient.send(new PutCommand({ TableName: DYNAMO_TABLE, Item: config }));
    await logAction('UPDATE_CONFIG', req.body);
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// Get global platform stats for analytics (Enhanced for Hotspots)
router.get('/stats', async (req, res) => {
  try {
    const [casesResp, patientsResp, doctorsResp] = await Promise.all([
      docClient.send(new QueryCommand({ TableName: DYNAMO_TABLE, KeyConditionExpression: "pk = :pk", ExpressionAttributeValues: { ":pk": "CASE" } })),
      docClient.send(new QueryCommand({ TableName: DYNAMO_TABLE, KeyConditionExpression: "pk = :pk", ExpressionAttributeValues: { ":pk": "PATIENT" } })),
      docClient.send(new QueryCommand({ TableName: DYNAMO_TABLE, KeyConditionExpression: "pk = :pk", FilterExpression: "#role = :role", ExpressionAttributeNames: { "#role": "role" }, ExpressionAttributeValues: { ":pk": "USER", ":role": "doctor" } }))
    ]);

    const cases = casesResp.Items || [];
    const hotspots = {};
    cases.forEach(c => {
      if (c.village) hotspots[c.village] = (hotspots[c.village] || 0) + 1;
    });

    res.json({
      totalConsultations: cases.length,
      activePatients: patientsResp.Items?.length || 0,
      activeDoctors: doctorsResp.Items?.filter(d => d.status === 'active').length || 0,
      triageStats: {
        EMERGENCY: cases.filter(c => c.urgency === 'EMERGENCY').length,
        CONSULT: cases.filter(c => c.urgency === 'CONSULT').length,
        SELF_CARE: cases.filter(c => c.urgency === 'SELF_CARE').length
      },
      hotspots,
      doctorPerformance: doctorsResp.Items?.map(d => {
        const docCases = cases.filter(c => c.specialty === d.specialty);
        return {
          id: d.sk,
          name: d.name,
          specialty: d.specialty,
          consultations: docCases.length,
          rating: 4.5 + (Math.random() * 0.5),
          villageReach: [...new Set(docCases.map(c => c.village))].length
        };
      }) || []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// Get all users for Management (Doctors, Patients, Workers)
router.get('/users/all', async (req, res) => {
  try {
    const response = await docClient.send(new ScanCommand({
      TableName: DYNAMO_TABLE,
      FilterExpression: "pk IN (:u, :p)",
      ExpressionAttributeValues: { ":u": "USER", ":p": "PATIENT" }
    }));
    res.json(response.Items || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// Create a new system user (Doctor or Worker)
router.post('/users/create', async (req, res) => {
  console.log('--- ADMIN: Create User Request ---', req.body);
  try {
    const { name, email, role, specialty } = req.body;
    if (!name || !email || !role) {
      console.warn('Missing required fields:', { name, email, role });
      return res.status(400).json({ error: 'Missing name, email, or role' });
    }

    const userId = `${role.toUpperCase()}#${Date.now()}`;
    
    const userEntry = {
      pk: 'USER',
      sk: userId,
      name,
      email,
      role,
      specialty: specialty || 'General Medicine',
      status: 'active',
      createdAt: new Date().toISOString()
    };

    console.log('Persisting to DynamoDB:', userEntry);
    await docClient.send(new PutCommand({ TableName: DYNAMO_TABLE, Item: userEntry }));
    
    console.log('Logging Action...');
    await logAction('CREATE_USER', { userId, role, name });
    
    console.log('User created successfully!');
    res.json({ message: 'User created successfully', user: userEntry });
  } catch (err) {
    console.error('CRITICAL: Create User Error:', err);
    res.status(500).json({ error: err.message || 'Failed' });
  }
});

// Update an existing user
router.patch('/users/update', async (req, res) => {
  try {
    const { userId, name, email, specialty } = req.body;
    await docClient.send(new UpdateCommand({
      TableName: DYNAMO_TABLE,
      Key: { pk: 'USER', sk: userId },
      UpdateExpression: "set #name = :name, email = :email, specialty = :spec",
      ExpressionAttributeNames: { "#name": "name" },
      ExpressionAttributeValues: { 
        ":name": name, 
        ":email": email, 
        ":spec": specialty || 'General Medicine' 
      }
    }));
    await logAction('UPDATE_USER', { userId, name });
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Update User Error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Toggle user status (Active/Inactive)
router.patch('/users/status', async (req, res) => {
  try {
    const { userId, currentStatus } = req.body;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await docClient.send(new UpdateCommand({
      TableName: DYNAMO_TABLE,
      Key: { pk: 'USER', sk: userId },
      UpdateExpression: "set #status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": newStatus }
    }));
    await logAction('TOGGLE_USER_STATUS', { userId, newStatus });
    res.json({ message: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully` });
  } catch (err) {
    console.error('Toggle Status Error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Delete a user permanently
router.delete('/users/delete/:userId', async (req, res) => {
  try {
    const userId = decodeURIComponent(req.params.userId);
    console.log('Deleting user:', userId);
    await docClient.send(new DeleteCommand({
      TableName: DYNAMO_TABLE,
      Key: { pk: 'USER', sk: userId }
    }));
    await logAction('DELETE_USER', { userId });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete User Error:', err);
    res.status(500).json({ error: err.message || 'Failed to delete user' });
  }
});

export default router;
