import { Router } from 'express';
import {
  getUsers,
  updateUserStatus,
  getSyncLogs,
  getAdminStats
} from '../controllers/adminController.js';

const router = Router();

router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/sync-logs', getSyncLogs);
router.get('/stats', getAdminStats);

export default router;
