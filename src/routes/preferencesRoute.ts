import { Router } from "express";

import { authenticate } from "../middlewares/authMiddleware";
import {
  getPreferences,
  savePreferences,
} from "../controllers/prefrenceController";

const preferenceRouter = Router();

// Save preferences
preferenceRouter.post("/preferences", savePreferences);

// Get preferences
preferenceRouter.get("/preferences", getPreferences);

export default preferenceRouter;
