import mongoose from "mongoose";

let isConnected = false;

export async function connectDB(uri?: string) {
  const mongoUri = uri || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn("MONGODB_URI not set. API will not function until configured.");
    return;
  }
  if (isConnected) return;
  try {
    await mongoose.connect(mongoUri, {
      dbName: process.env.MONGODB_DB_NAME || undefined,
      // @ts-expect-error: allow flexible options
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error", err);
  }
}

export { isConnected };
