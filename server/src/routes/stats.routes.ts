import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  byCategoryHandler,
  summaryHandler,
} from '../controllers/stats.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/summary', summaryHandler);
router.get('/by-category', byCategoryHandler);

export default router;
