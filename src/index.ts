import bodyParser from "body-parser";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";

import authRouter from "./routes/authRoute";
import cookieParser from "cookie-parser";
import { authenticate } from "./middlewares/authMiddleware";
import preferenceRouter from "./routes/preferencesRoute";
import { createClient } from "redis";

// Load environment variables
dotenv.config();
declare module "express-session" {
  interface SessionData {
    user?: { name: string; email: string }; // Define your custom session property
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Initialize Redis client
const redisClient = createClient({
  url: process.env.UPSTASH_URL || "redis://localhost:6379",
});

redisClient
  .connect()
  .then(() => {
    console.log("Redis connected 🟢");
  })
  .catch((err) => {
    console.log("Error connecting to Redis", err);
  });
// initialize the express session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "SECRET",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 3,
    },
  })
);

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

// Routes
app.get("/", authenticate, (req, res) => {
  res.send("Hello World");
});
app.use("/api/auth", authRouter);
app.use("/api", preferenceRouter);
// Route to set a session variable
app.get("/set-session", (req, res) => {
  req.session.user = { name: "Abhishek", email: "abhishek@example.com" };
  res.send("Session variable 'user' has been set!");
});

// Route to get the session variable
app.get("/get-session", (req, res) => {
  if (req.session.user) {
    res.send(`Session user: ${JSON.stringify(req.session.user)}`);
  } else {
    res.send("No session user found!");
  }
});

// Route to destroy the session
app.get("/destroy-session", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send("Failed to destroy session");
    } else {
      res.send("Session destroyed!");
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
