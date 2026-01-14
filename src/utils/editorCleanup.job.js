import cron from "node-cron";
import { scheduledCleanup } from "../controllers/blogs.controller.js";

export const startEditorCleanupJob = () => {
  //  Runs every day at 2 AM
  cron.schedule("0 2 * * *", async () => {
    console.log(" Cron triggered: Editor cleanup");
    await scheduledCleanup();
  });

  console.log(" Editor cleanup cron job scheduled (02:00 AM daily)");
};
