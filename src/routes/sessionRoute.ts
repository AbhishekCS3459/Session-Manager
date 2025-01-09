// routes/sessionRoute.ts
import { Router } from "express";
import { Request, Response } from "express";
import User from "../model/User";

const sessionRouter = Router();

// POST /session: Start a new session.
sessionRouter.post("/", (req: Request, res: Response) => {
  console.log("Session started");
  req.session.startTime = new Date().toISOString(); // Store ISO string for consistency
  req.session.pagesVisited = []; // Initialize pages visited array
  res.status(200).send("Session initialized!");
});

// GET /session: Retrieve session details.
sessionRouter.get("/", (req: Request, res: any) => {
  if (!req.session.startTime) {
    console.log("No active session.");
    return res.status(404).send("No active session.");
  }

  const startTime = new Date(req.session.startTime); // Convert string to Date
  const now = new Date();
  const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000); // Calculate duration in seconds

  res.status(200).send({
    startTime,
    pagesVisited: req.session.pagesVisited || [],
    sessionDuration: duration,
  });
});

// POST /session/page: Log a page visit.
sessionRouter.post("/page", async (req: Request, res: any) => {
  const { page } = req.body;
  if (!page || typeof page !== "string") {
    return res.status(400).send("Invalid 'page' parameter.");
  }

  req.session.pagesVisited = req.session.pagesVisited || [];
  req.session.pagesVisited.push(page);

  if (req.session.user) {
    // Update MongoDB for authenticated users
    await User.findOneAndUpdate(
      { email: req.session.user.email },
      { $push: { "sessionData.pagesVisited": page } }
    );
  }

  res.status(200).send(`Page '${page}' added to session.`);
});

// DELETE /session: End the current session.
sessionRouter.delete("/", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Failed to destroy session.");
    }
    res.status(200).send("Session destroyed.");
  });
});

// Export the session router
export default sessionRouter;
