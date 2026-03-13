import express from "express";
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "../controllers/job.controller.js";

import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { dynamicUpload } from "../middlewares/upload.js";

const router = express.Router();

const { upload, handleUpload } = dynamicUpload("jobs", "job_image");

router.post(
  "/",
  verifyAccessToken,
  upload.single("job_image"),
  handleUpload,
  createJob
);

router.get("/", getJobs);
router.get("/:id", getJobById);

router.put(
  "/:id",
  verifyAccessToken,
  upload.single("job_image"),
  handleUpload,
  updateJob
);

router.delete("/:id", verifyAccessToken, deleteJob);

export default router;
