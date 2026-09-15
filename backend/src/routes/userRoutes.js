import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  getMe,
  updateMe
} from '../controllers/userController.js';

const router = Router();

router.get('/me', requireAuth, getMe);
router.put('/me', requireAuth, updateMe);

export default router;

