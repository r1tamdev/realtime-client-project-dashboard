import 'dotenv/config';
import './middleware/types';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './modules/auth/auth.routes';

const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.use(errorHandler);

export default app;