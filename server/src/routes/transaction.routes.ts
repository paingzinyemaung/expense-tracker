import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
} from '../schemas/transaction.schema.js';
import {
  createHandler,
  deleteHandler,
  listHandler,
  updateHandler,
} from '../controllers/transaction.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', listHandler);
router.post('/', validateBody(createTransactionSchema), createHandler);
router.patch('/:id', validateBody(updateTransactionSchema), updateHandler);
router.delete('/:id', deleteHandler);

export default router;
