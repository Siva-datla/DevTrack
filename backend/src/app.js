import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import router from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/index.js';
import { connectDB } from './config/db.js';

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection middleware for both local and serverless/Vercel execution
app.use(async (req, res, next) => {
  // Skip DB connection for basic health checks if preferred, or ensure DB
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[MongoDB Error]:', err.message);
    next(err);
  }
});

// Routes
app.use(router);
// Error handling middleware
app.use(errorHandler);
app.use(notFoundHandler);

export default app;