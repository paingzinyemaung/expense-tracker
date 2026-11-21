import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import statsRoutes from './routes/stats.routes.js';
import transactionRoutes from './routes/transaction.routes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// API response တွေကို CDN/browser က cache မလုပ်စေ (user တစ်ယောက်ချင်းစီရဲ့ private ဒေတာမို့)
app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stats', statsRoutes);

app.use(errorHandler);

// ကိုယ့်စက်မှာပဲ port ဖွင့်၊ Vercel (serverless) မှာ app ကို export လုပ်ရုံ
if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT}`);
  });
}

export default app;
