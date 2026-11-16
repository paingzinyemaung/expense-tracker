// import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

import { errorHandler } from './middleware/errorHandler.js';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import transactionRoutes from './routes/transaction.routes.js';

const app = express();
// const PORT = process.env.PORT ?? 4000;

// middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json()); // parse JSON request body
app.use(cookieParser()); // parse cookies

// test routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/health/db', async (_req, res) => {
  const users = await prisma.user.count(); // Example query to check database connectivity
  res.json({
    status: 'ok',
    users,
  });
});

// auth routes
app.use('/api/auth', authRoutes);
// category routes
app.use('/api/categories', categoryRoutes);
// transaction routes
app.use('/api/transactions', transactionRoutes);

// error handler middleware (should be the last middleware)
app.use(errorHandler);

// start server
app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}...`);
});
