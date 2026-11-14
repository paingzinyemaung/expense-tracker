// import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

const app = express();
// const PORT = process.env.PORT ?? 4000;

// middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json()); // parse JSON request body

// routes
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

// start server
app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}...`);
});
