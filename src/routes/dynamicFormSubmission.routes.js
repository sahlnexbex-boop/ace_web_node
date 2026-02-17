import express from "express";
import {
    startFormSubmission,
    getAllSubmissions,
    getSubmissionById,
    updateSubmission,
    deleteSubmission,
    downloadSubmissionsExcel,
} from "../controllers/dynamicFormSubmission.controller.js";

import { dynamicUpload } from "../middlewares/upload.js";

const router = express.Router();
const { upload, handleUpload } = dynamicUpload("dynamic_submissions");

// Base route: /api/dynamic-submissions (to be defined in server.js)

router.get("/download-excel", downloadSubmissionsExcel); // Download Excel
router.post("/", upload.any(), handleUpload, startFormSubmission); // Create submission
router.get("/", getAllSubmissions); // List all submissions (with optional ?event_id= filter)
router.get("/:id", getSubmissionById); // Get specific submission
router.put("/:id", upload.any(), handleUpload, updateSubmission); // Update submission
router.delete("/:id", deleteSubmission); // Delete submission

export default router;
