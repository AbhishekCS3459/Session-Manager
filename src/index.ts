import bodyParser from "body-parser";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
import cookieParser from "cookie-parser";
import { authenticate } from "./middlewares/authMiddleware";
import authRouter from "./routes/authRoute";
import preferenceRouter from "./routes/preferencesRoute";
import sessionRouter from "./routes/sessionRoute";
import { CustomRedisStore } from "./db/CustomRedisStore";

// Load environment variables
dotenv.config();
declare module "express-session" {
  interface SessionData {
    user?: { name: string; email: string };
    pagesVisited?: string[];
    startTime?: Date | string;
    actions?: { action: string; timestamp: Date }[];
  }
}


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize the express session
const redisStore = new CustomRedisStore();
app.use(
  session({
    store: redisStore,
    secret: process.env.SESSION_SECRET || "SECRET",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 30 * 60 * 1000, // 30 minutes
    },
  })
);

// Connect to MongoDB
const connectToDB = async () => {
  const DB_URI = process.env.DB_URI || "mongodb://localhost:27017/amplifyx";
  try {
    await mongoose.connect(DB_URI, { autoIndex: true });
    console.log("Connected to DB");
  } catch (error) {
    console.log("Error connecting to DB", error);
  }
};
connectToDB();

// Routes
app.use("/api/auth", authRouter);
app.use("/api", preferenceRouter);
app.use("/api/session", sessionRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
