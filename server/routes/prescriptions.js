import express from 'express';
import multer from 'multer';
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { docClient, s3Client, DYNAMO_TABLE, S3_BUCKET } from '../config/aws.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Save a prescription (Manual by Doctor)
router.post('/', async (req, res) => {
  try {
    const { patientId, doctorId, doctorName, medicines, tests, notes } = req.body;
    if (!patientId || !doctorId) return res.status(400).json({ error: 'Missing fields' });

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

    await docClient.send(new PutCommand({ TableName: DYNAMO_TABLE, Item: prescriptionRecord }));
    res.status(201).json(prescriptionRecord);
  } catch (err) {
    console.error('Prescription Save Error:', err);
    res.status(500).json({ error: 'Failed to save prescription' });
  }
});

// Upload a prescription (Patient Self-Upload)
router.post('/upload', upload.single('prescription'), async (req, res) => {
  try {
    const { patientId } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const s3Key = `prescriptions/${patientId}/${Date.now()}-${file.originalname}`;
    await s3Client.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype
    }));

    const photoUrl = `https://${S3_BUCKET}.s3.amazonaws.com/${s3Key}`;
    
    const prescriptionRecord = {
      pk: `PRESCRIPTION#${patientId}`,
      sk: `RX#UPLOAD#${Date.now()}`,
      patientId,
      doctorName: "Self Upload",
      photoUrl,
      medicines: [],
      notes: "Uploaded by patient",
      createdAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({ TableName: DYNAMO_TABLE, Item: prescriptionRecord }));
    res.status(201).json(prescriptionRecord);
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Failed to upload' });
  }
});

// Get prescriptions for a patient
router.get('/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const response = await docClient.send(new QueryCommand({
      TableName: DYNAMO_TABLE,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": `PRESCRIPTION#${patientId}`,
      },
      ScanIndexForward: false,
    }));
    res.json(response.Items || []);
  } catch (err) {
    console.error('Fetch Prescriptions Error:', err);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

export default router;