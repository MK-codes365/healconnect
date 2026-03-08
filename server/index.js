import './config/dotenv.js';
import express from 'express';
import cors from 'cors';
import aiRoutes from './routes/ai.js';
import patientRoutes from './routes/patients.js';
import caseRoutes from './routes/cases.js';
import chatRoutes from './routes/chat.js';
import prescriptionRoutes from './routes/prescriptions.js';
import adminRoutes from './routes/admin.js';
import doctorRoutes from './routes/doctors.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Verbose Logging for Debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctors', doctorRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Heal Connect Server running on http://localhost:${PORT}`);
});
