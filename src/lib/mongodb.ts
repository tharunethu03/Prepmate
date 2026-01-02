import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the NodeJS global type
declare global {
  var mongooseCache: MongooseCache;
}

// Use the global cache or initialize it
const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};
global.mongooseCache = cached;

async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      // These are optional now in latest Mongoose versions
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    };

    cached.promise = mongoose
      .connect(process.env.DATABASE_URL!, opts)
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;
