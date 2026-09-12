import dns from "node:dns";
import mongoose from "mongoose";

// Resolve MongoDB Atlas SRV records reliably in local Node environments
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1", "1.0.0.1"]);
} catch {
  // Ignore in environments where setting DNS servers is restricted
}

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (connectionPromise) return connectionPromise;

  const uri = process.env["MONGODB_URI"];
  if (!uri) throw new Error("MONGODB_URI environment variable is not set.");

  connectionPromise = mongoose
    .connect(uri, {
      dbName: process.env["MONGODB_DB"] ?? "venueflow",
      serverSelectionTimeoutMS: 5000, // fail fast in dev if no DB is running
      connectTimeoutMS: 5000,
    })
    .then((m) => {
      console.log("[db] MongoDB connected");
      return m;
    })
    .catch((err) => {
      connectionPromise = null;
      throw err;
    });

  return connectionPromise;
}
