import mongoose from 'mongoose';

/**
 * Connects to MongoDB database with connection event listeners
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    process.exit(1);
  }
};

// Event listener: when disconnected
mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Connection lost. Disconnected from database.');
});

// Event listener: runtime errors
mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB] Runtime error: ${err.message}`);
});

// Graceful shutdown on process termination (Ctrl+C / SIGINT)
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('[MongoDB] Connection closed due to application termination.');
  process.exit(0);
});

export default connectDB;
