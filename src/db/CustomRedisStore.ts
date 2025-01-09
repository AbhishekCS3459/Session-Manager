import session from "express-session";
import { createClient, RedisClientType } from "redis";

export class CustomRedisStore extends session.Store {
  private redisClient: RedisClientType;

  constructor() {
    super();

    // Initialize the Redis client
    this.redisClient = createClient({
      url: process.env.UPSTASH_URL || "redis://localhost:6379",
    });
    // Connect to Redis
    this.redisClient
      .connect()
      .then(() => {
        console.log("Redis connected 🟢");
      })
      .catch((err) => {
        console.error("Failed to connect to Redis:", err);
      });
  }

  // Retrieve session by session ID
  get(
    sid: string,
    callback: (err: any, session?: session.SessionData | null) => void
  ): void {
    this.redisClient
      .get(sid)
      .then((data) => {
        if (data) {
          callback(null, JSON.parse(data));
        } else {
          callback(null, null);
        }
      })
      .catch((err) => {
        callback(err);
      });
  }

  // Save session to Redis
  set(
    sid: string,
    sessionData: session.SessionData,
    callback?: (err?: any) => void
  ): void {
    const ttl = sessionData.cookie?.maxAge || 30 * 60 * 1000; // Default 30 minutes

    this.redisClient
      .set(sid, JSON.stringify(sessionData), {
        PX: ttl, // Set expiration in milliseconds
      })
      .then(() => {
        if (callback) callback();
      })
      .catch((err) => {
        if (callback) callback(err);
      });
  }

  // Destroy session by session ID
  destroy(sid: string, callback?: (err?: any) => void): void {
    this.redisClient
      .del(sid)
      .then(() => {
        if (callback) callback();
      })
      .catch((err) => {
        if (callback) callback(err);
      });
  }
}
