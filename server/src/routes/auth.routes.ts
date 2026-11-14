import { Router } from 'express';
import { validateBody } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';
import {
  loginHandler,
  meHandler,
  registerHandler,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', validateBody(registerSchema), registerHandler);
router.post('/login', validateBody(loginSchema), loginHandler);
router.get('/me', requireAuth, meHandler);

export default router;
