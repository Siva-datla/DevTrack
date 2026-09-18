import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  getMe,
  updateMe,
  exportUserData,
} from '../controllers/userController.js';

const router = Router();

router.get('/me', requireAuth, getMe);
router.put('/me', requireAuth, updateMe);
router.get('/me/export', requireAuth, exportUserData);

export default router;

