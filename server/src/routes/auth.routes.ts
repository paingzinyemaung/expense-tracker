import { Router } from 'express';
import { validateBody } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';
import {
  loginHandler,
  logoutHandler,
  meHandler,
  refreshHandler,
  registerHandler,
} from '../controllers/auth.controller.js';

const router = Router();

// auth routes
router.post('/register', validateBody(registerSchema), registerHandler);
router.post('/login', validateBody(loginSchema), loginHandler);
router.get('/me', requireAuth, meHandler);

router.post('/refresh', refreshHandler);
router.post('/logout', logoutHandler);

export default router;
