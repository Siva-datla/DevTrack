import express from 'express';
import cors from 'cors';
import router from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/index.js';

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(router);
// Error handling middleware
app.use(errorHandler);
app.use(notFoundHandler);


export default app;