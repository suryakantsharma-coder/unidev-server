import mongoose from 'mongoose';
import { env } from './env';

export async function connectDb(): Promise<void> {
  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment');
  }
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
