import { Router } from "express";

import { requireAuth, requireRole } from "../../middleware/auth.ts";
import { runEngagementRefreshCycle } from "../jobs/engagementCron.ts";
import { sendError, sendSuccess } from "../utils/api-response.ts";

const adminRouter = Router();

adminRouter.post("/trigger-engagement-refresh", requireAuth, requireRole("FOUNDER"), async (_request, response) => {
  try {
    const summary = await runEngagementRefreshCycle();

    sendSuccess(
      response,
      {
        message: summary.skipped ? "Engagement refresh is already running" : "Engagement refresh completed",
        ...summary
      },
      summary.skipped ? 202 : 200
    );
  } catch {
    sendError(response, "Failed to run engagement refresh", 500);
  }
});

export { adminRouter };
