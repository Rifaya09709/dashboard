import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './database';
import statsRoutes     from './routes/stats.routes';
import workorderRoutes from './routes/workorder.routes';
import authRoutes      from './routes/auth.routes';
import reportRoutes    from './routes/report.routes';
import feedbackRoutes  from './routes/feedback.routes';
import { errorHandler } from './middleware/errorHandler';
import { startScheduler } from './scheduler';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  credentials: false
}));
app.use(express.json());

// Routes
app.use('/api/stats',      statsRoutes);
app.use('/api/workorders', workorderRoutes);
app.use('/api/auth',       authRoutes);
app.use('/api/reports',    reportRoutes);
app.use('/api/feedback',   feedbackRoutes);

app.get('/api/health', (_, res) =>
  res.json({ status: 'OK', timestamp: new Date(), version: '2.1' })
);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard:  http://localhost:5173`);
    console.log(`📧 Email feedback: http://localhost:${PORT}/api/feedback/rate`);
    startScheduler();
  });
});