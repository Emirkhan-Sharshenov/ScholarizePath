import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

// Vercel runs each route handler as its own serverless invocation, and warm
// instances reuse this module's state — but nothing stops two concurrent
// cold invocations from both seeing readyState 0 and both calling
// mongoose.connect() at once. That race is a well-known source of
// intermittent "Internal Server Error" under concurrent traffic. Caching the
// in-flight connect() promise (not just the connection) means every
// concurrent caller awaits the *same* connection attempt instead of racing
// to start their own.
let connectionPromise: ReturnType<typeof mongoose.connect> | null = null;

export async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(MONGODB_URI).catch((err) => {
            // A failed attempt must not be cached — let the next call retry.
            connectionPromise = null;
            throw err;
        });
    }

    await connectionPromise;
}