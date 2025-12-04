import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express';

// Load environment variables
dotenv.config();

// Import routes
import shiftsRouter from './routes/shifts';
import attendanceRouter from './routes/attendance';
import calloutsRouter from './routes/callouts';
import notificationsRouter from './routes/notifications';
import usersRouter from './routes/users';
import rolesRouter from './routes/roles';
import settingsRouter from './routes/settings';
import timeOffRouter from './routes/time-off';
import shiftSwapsRouter from './routes/shift-swaps';
import availabilityChangesRouter from './routes/availability-changes';
import onboardingRouter from './routes/onboarding';

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration - allows Vercel deployments and localhost
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

// Also allow any Vercel preview URL for this project
const isAllowedOrigin = (origin: string | undefined) => {
  if (!origin) return true; // Allow requests with no origin
  
  // Check exact matches
  if (allowedOrigins.includes(origin)) return true;
  
  // Allow any smartshift Vercel deployment
  if (origin.includes('smartshift') && origin.includes('.vercel.app')) {
    console.log('✅ Allowing Vercel deployment:', origin);
    return true;
  }
  
  return false;
};

console.log('🌐 Base allowed origins:', allowedOrigins);
console.log('📝 Also allowing any smartshift*.vercel.app URLs');

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      console.error('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(clerkMiddleware());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/shifts', shiftsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/callout', calloutsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/users', usersRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/time-off', timeOffRouter);
app.use('/api/shift-swaps', shiftSwapsRouter);
app.use('/api/availability-changes', availabilityChangesRouter);
app.use('/api/onboarding', onboardingRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
