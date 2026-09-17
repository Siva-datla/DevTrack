import { Router } from 'express';
import { optionalAuth } from '../middleware/authMiddleware.js';
import {
  getGoals,
  createGoal,
  getGoalById,
  updateGoal,
  deleteGoal
} from '../controllers/goalController.js';

const router = Router();

router.get('/', optionalAuth, getGoals);
router.post('/', optionalAuth, createGoal);
router.get('/:id', optionalAuth, getGoalById);
router.put('/:id', optionalAuth, updateGoal);
router.delete('/:id', optionalAuth, deleteGoal);

export default router;
