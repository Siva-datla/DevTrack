import { Router } from 'express';
import {
  getSubmissions,
  getSubmissionById
} from '../controllers/submissionController.js';

const router = Router();

router.get('/', getSubmissions);
router.get('/:id', getSubmissionById);

export default router;
