import express from 'express';
import multer from 'multer';
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { docClient, s3Client, DYNAMO_TABLE, S3_BUCKET } from '../config/aws.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Register a new patient
router.post('/register', upload.single('photo'), async (req, res) => {
  try {
    const { name, age, email, role = 'patient' } = req.body;
    const file = req.file;
    let photoUrl = '';

    // 1. Upload to S3 if photo exists
    if (file) {
      const s3Key = `patients/${Date.now()}-${file.originalname}`;
      await s3Client.send(new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype
      }));
      photoUrl = `https://${S3_BUCKET}.s3.amazonaws.com/${s3Key}`;
    }

    // 2. Save to DynamoDB
    const patientId = `ID#${Date.now()}`;
    const patientRecord = {
      pk: 'PATIENT',
      sk: patientId,
      name,
      age,
      gender: req.body.gender, // Added
      village: req.body.village, // Added
      phone: req.body.phone, // Added
      medicalHistory: req.body.medicalHistory, // Added
      email,
      role,
      photoUrl,
      createdAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: DYNAMO_TABLE,
      Item: patientRecord
    }));

    res.status(201).json({ 
      message: 'Patient registered successfully', 
      patient: patientRecord 
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Failed to register patient', details: err.message });
  }
});

// List all patients
router.get('/', async (req, res) => {
  try {
    const response = await docClient.send(new QueryCommand({
      TableName: DYNAMO_TABLE,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": "PATIENT"
      }
    }));

    res.json(response.Items || []);
  } catch (err) {
    console.error('Fetch Error:', err);
    res.status(500).json({ error: 'Failed to fetch patients', details: err.message });
  }
});

export default router;
