import bodyParser from "body-parser";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo";
import authRouter from "./routes/authRoute";
import cookieParser from "cookie-parser";
import { authenticate } from "./middlewares/authMiddleware";
import preferenceRouter from "./routes/preferencesRoute";

// Load environment variables
dotenv.config();

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

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DB_URI || "mongodb://localhost:27017/amplifyx",
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
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
app.get("/",authenticate, (req, res) => {
  res.send("Hello World");
})
// Routes
app.use("/api/auth", authRouter);
app.use("/api", preferenceRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
