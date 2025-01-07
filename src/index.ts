import bodyParser from "body-parser";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { RedisClient } from "./db/redis";
import Redis from "ioredis";
// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
const connectToDB = async () => {
  const DB_URI = process.env.DB_URI || "mongodb://localhost:27017/amplifyx";
  try {
    await mongoose.connect(DB_URI, {
      autoIndex: true,
    });
    console.log("Connected to DB");
  } catch (error) {
    console.log("Error connecting to DB", error);
  }
};

connectToDB();

// Basic route
app.get("/", (req, res) => {
  res.json({
    msg: "ok",
  });
});

// Placeholder for routes like `/api1/v1/`

(() => {
 const client=RedisClient.getInstance();
})();

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
