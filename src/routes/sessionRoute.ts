// routes/sessionRoute.ts
import { Router } from "express";
import { Request, Response } from "express";
import User from "../model/User";
import { authenticate } from "../middlewares/authMiddleware";

const sessionRouter = Router();

// POST /session: Start a new session.
sessionRouter.post("/", (req: Request, res: Response) => {
  console.log("Session started");
  req.session.startTime = new Date().toISOString(); // Store ISO string for consistency
  req.session.pagesVisited = []; // Initialize pages visited array
  res.status(200).send("Session initialized!");
});

// GET /session: Retrieve session details.
sessionRouter.get("/", async (req: Request, res: any) => {
  if (!req.session.startTime) {
    return res.status(404).send("No active session.");
  }

  const { page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page as string, 10);
  const pageSize = parseInt(limit as string, 10);

  const pagesVisited = req.session.pagesVisited || [];
  const total = pagesVisited.length;

  // Paginate pagesVisited
  const paginatedPages = pagesVisited.slice(
    (pageNum - 1) * pageSize,
    pageNum * pageSize
  );

  res.status(200).send({
    startTime: req.session.startTime,
    sessionDuration: Math.floor(
      (Date.now() - new Date(req.session.startTime).getTime()) / 1000
    ),
    total,
    page: pageNum,
    limit: pageSize,
    pagesVisited: paginatedPages,
  });
});

// POST /session/page: Log a page visit.
sessionRouter.post("/page", async (req: Request, res: any) => {
  const { page } = req.body;

  if (!page || typeof page !== "string") {
    return res.status(400).send("Invalid 'page' parameter.");
  }

  const timestamp = new Date();
  const action = `Visited page: ${page}`;

  req.session.pagesVisited = req.session.pagesVisited || [];
  req.session.pagesVisited.push(page);

  req.session.actions = req.session.actions || [];
  req.session.actions.push({ action, timestamp });

  if (req.session.user) {
    await User.findOneAndUpdate(
      { email: req.session.user.email },
      {
        $push: {
          "sessionData.pagesVisited": page,
          "sessionData.actions": { action, timestamp },
        },
      }
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
//routes for action
sessionRouter.post("/action", async (req: Request, res: any) => {
  const { action } = req.body;

  if (!action || typeof action !== "string") {
    return res.status(400).send("Invalid 'action' parameter.");
  }

  const timestamp = new Date();

  req.session.actions = req.session.actions || [];
  req.session.actions.push({ action, timestamp });

  if (req.session.user) {
    // Update MongoDB for authenticated users
    await User.findOneAndUpdate(
      { email: req.session.user.email },
      { $push: { "sessionData.actions": { action, timestamp } } }
    );
  }

  res.status(200).send(`Action '${action}' logged successfully.`);
});
// Step 2.2: Handle Pagination for MongoDB (Optional)
sessionRouter.get(
  "/user-session",
  authenticate,
  async (req: Request, res: any) => {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

    const user = await User.findOne(
      { email: req.session.user?.email },
      {
        "sessionData.pagesVisited": {
          $slice: [(pageNum - 1) * pageSize, pageSize],
        },
        "sessionData.startTime": 1,
      }
    );

    if (!user) {
      return res.status(404).send("No session data found.");
    }

    const total =
      (await User.findOne({ email: req.session.user?.email }))?.sessionData
        .pagesVisited.length || 0;

    res.status(200).send({
      startTime: user.sessionData.startTime,
      pagesVisited: user.sessionData.pagesVisited,
      total,
      page: pageNum,
      limit: pageSize,
    });
  }
);

// Export the session router
export default sessionRouter;
