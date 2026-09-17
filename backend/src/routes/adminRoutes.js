import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import {
  getUsers,
  updateUserStatus,
  getSyncLogs,
  getAdminStats
} from '../controllers/adminController.js';

const router = Router();

// Guard all admin routes with authentication & administrator authorization
router.use(requireAuth, requireAdmin);

router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/sync-logs', getSyncLogs);
router.get('/stats', getAdminStats);

export default router;
