import express from "express";
import {
  createJobApplication,
  getJobApplications,
  getJobApplicationById,
  updateJobApplication,
  deleteJobApplication,
  downloadJobApplicationExcel,
} from "../controllers/job_apps.controller.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { dynamicUpload } from "../middlewares/upload.js";

const router = express.Router();

// Excel download
router.get("/download-excel", verifyAccessToken, downloadJobApplicationExcel);
const { upload, handleUpload } = dynamicUpload("job_applications", "resume_file");

router.post(
  "/",
  upload.single("resume_file"),
  handleUpload,
  createJobApplication
);
router.get("/", getJobApplications);
router.get("/:id", getJobApplicationById);


router.put(
  "/:id",
  verifyAccessToken,
  upload.single("resume_file"),
  handleUpload,
  updateJobApplication
);
router.delete("/:id", verifyAccessToken, deleteJobApplication);

export default router;
