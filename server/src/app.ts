import 'dotenv/config';
import './middleware/types';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './modules/auth/auth.routes';

import projectRoutes from './modules/projects/project.routes';
import taskRoutes from './modules/tasks/task.routes';
import activityRoutes from './modules/activity/activity.routes';
import notificationRoutes from './modules/notifications/notification.routes';

const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

export default app;