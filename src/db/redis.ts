import Redis from "ioredis";

export class RedisClient {
  private static instance: RedisClient;
  private client: Redis;

  private constructor() {
    this.client = new Redis({
      host:
        process.env.REDIS_HOST ||
        "redis-14614.c135.eu-central-1-1.ec2.cloud.redislabs.com",
      port: parseInt(process.env.REDIS_PORT || "14614"),
      username: "default",
      password: process.env.REDIS_PASSWORD || "password",
    });

    this.client.on("connect", () => {
      console.log("Redis connected 🟢");
    });

    this.client.on("error", (err: any) => {
      console.error("Redis connection error:", err);
    });
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  async fetch(): Promise<string> {
    try {
      const response = await this.client.lpop("DATA_QUEUE");
      return response || "";
    } catch (error) {
      console.error("Error fetching from queue:", error);
      return "";
    }
  }

  async sendQueue(message: string) {
    try {
      await this.client.rpush("DATA_QUEUE", message);
      await this.client.expire("DATA_QUEUE", 30);
    } catch (error) {
      console.error("Error pushing to queue:", error);
    }
  }

  async subscribe(channel: string) {
    try {
      await this.client.subscribe(channel);
      console.log(`Subscribed to channel: ${channel}`);

      this.client.on("message", (channel, message) => {
        console.log(`Received message from ${channel}: ${message}`);
      });
    } catch (error) {
      console.error("Error subscribing to channel:", error);
    }
  }

  async cacheValue(key: string, value: string): Promise<boolean> {
    try {
      await this.client.set(key, value);
      return true;
    } catch (error) {
      console.error("Error caching value:", error);
      return false;
    }
  }

  async getValue(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error("Error fetching value:", error);
      return null;
    }
  }

  async multiGet(keys: string[]): Promise<(string | null)[]> {
    try {
      return await this.client.mget(...keys);
    } catch (error) {
      console.error("Error fetching multiple keys:", error);
      return [];
    }
  }
}
