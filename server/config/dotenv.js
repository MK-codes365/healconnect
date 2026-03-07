import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const result = dotenv.config({ path: path.resolve(__dirname, '../../.env') });
if (result.error) {
  console.error("Dotenv Error:", result.error);
} else {
  console.log("Dotenv loaded successfully.");
}
