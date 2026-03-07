import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const region = process.env.VITE_AWS_REGION || "us-east-1";

const credentials = {
  accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY,
};

// DynamoDB Client
const ddbClient = new DynamoDBClient({ region, credentials });
export const docClient = DynamoDBDocumentClient.from(ddbClient);

// S3 Client
export const s3Client = new S3Client({ region, credentials });

export const DYNAMO_TABLE = "healconnect";
export const S3_BUCKET = process.env.VITE_S3_BUCKET || "heal-connect-assets";
