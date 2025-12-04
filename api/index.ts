import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';

// Import routes
import shiftsRouter from '../backend/routes/shifts';
import attendanceRouter from '../backend/routes/attendance';
import calloutsRouter from '../backend/routes/callouts';
import notificationsRouter from '../backend/routes/notifications';
import usersRouter from '../backend/routes/users';
import rolesRouter from '../backend/routes/roles';
import settingsRouter from '../backend/routes/settings';
import timeOffRouter from '../backend/routes/time-off';
import shiftSwapsRouter from '../backend/routes/shift-swaps';
import availabilityChangesRouter from '../backend/routes/availability-changes';
import onboardingRouter from '../backend/routes/onboarding';

const app = express();

// CORS configuration - allow all Vercel domains
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(clerkMiddleware());

// Health check
app.get('/api/health', (req, res) => {
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

// Export for Vercel
export default app;
