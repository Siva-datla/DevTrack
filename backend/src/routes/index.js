import { Router } from 'express';
import { getHealth } from '../controllers/healthController.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import platformRoutes from './platformRoutes.js';
import submissionRoutes from './submissionRoutes.js';
import problemRoutes from './problemRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import contestRoutes from './contestRoutes.js';
import goalRoutes from './goalRoutes.js';
import leaderboardRoutes from './leaderboardRoutes.js';
import adminRoutes from './adminRoutes.js';
import testingRoute from './testingRoute.js';
const router = Router();

// Health Check
router.get('/health', getHealth);

// API Routes
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/platforms', platformRoutes);
router.use('/api/submissions', submissionRoutes);
router.use('/api/problems', problemRoutes);
router.use('/api/dashboard', dashboardRoutes);
router.use('/api/contests', contestRoutes);
router.use('/api/goals', goalRoutes);
router.use('/api/leaderboard', leaderboardRoutes);
router.use('/api/admin', adminRoutes);
router.use('/test',testingRoute);



export default router;
