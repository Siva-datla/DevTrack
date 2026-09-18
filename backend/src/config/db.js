import mongoose from 'mongoose';

/**
 * Connects to MongoDB database with connection event listeners
 */
export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (mongoose.connection.readyState === 2) {
    return new Promise((resolve, reject) => {
      mongoose.connection.once('connected', () => resolve(mongoose.connection));
      mongoose.connection.once('error', reject);
    });
  }

  const uri =
    process.env.MONGODB_URI ||
    'mongodb+srv://sivadatla4545_db_user:U6KXhSq89sJCGew8@cluster0.lybh1al.mongodb.net/devtrack';


  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);

    // Drop legacy submission index if it exists
    try {
      await mongoose.connection.collection('submissions').dropIndex('platform_1_platformSubmissionId_1');
    } catch {
      // Index already dropped or not present
    }

    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    throw error;
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
