import mongoose from "mongoose";

/**
 * This is a workaround for Next.js hot-reloading
 * We need to cache the MongoDB connection to avoid creating multiple connections during development
 */
declare global {
    // eslint-disable-next-line no-var
    var mongooseConnection:
        | {
            conn: typeof mongoose | null;
            promise: Promise<typeof mongoose> | null;
        }
        | undefined;
}

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

// Define the connection interface
interface Cached {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// Initialize cached connection
const cached: Cached = global.mongooseConnection || {
    conn: null,
    promise: null,
};

// Save the connection in global for reuse
if (!global.mongooseConnection) {
    global.mongooseConnection = cached;
}

async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose
            .connect(MONGODB_URI as string)
            .then((mongoose) => {
                console.log("Connected to MongoDB");
                return mongoose;
            })
            .catch((error) => {
                console.error("Error connecting to MongoDB:", error);
                throw error;
            });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        cached.promise = null; // Reset promise on error
        throw error;
    }
}

export default connectToDatabase;