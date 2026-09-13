import { Router } from 'express';
import {
  getPlatforms,
  addPlatform,
  deletePlatform,
  syncPlatform,
  getPlatformStatus
} from '../controllers/platformController.js';

const router = Router();

router.get('/', getPlatforms);
router.post('/', addPlatform);
router.delete('/:platform', deletePlatform);
router.post('/:platform/sync', syncPlatform);
router.get('/:platform/status', getPlatformStatus);

export default router;
