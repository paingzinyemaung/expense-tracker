import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../schemas/category.schema.js';
import {
  createHandler,
  deleteHandler,
  listHandler,
  updateHandler,
} from '../controllers/category.controller.js';

const router = Router();

router.use(requireAuth); // ဒီအောက်က route အားလုံး login လိုတယ်

router.get('/', listHandler);
router.post('/', validateBody(createCategorySchema), createHandler);
router.patch('/:id', validateBody(updateCategorySchema), updateHandler);
router.delete('/:id', deleteHandler);

export default router;
