import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Start HTTP Server
  app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(` DevTrack Backend running on port ${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/health`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`========================================`);
  });
};

startServer();