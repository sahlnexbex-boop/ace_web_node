import express from "express";
import {
  createScholarshipExam,
  getScholarshipExams,
  getScholarshipExamById,
  updateScholarshipExam,
  deleteScholarshipExam,
} from "../controllers/scholarshipExam.controller.js";

import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { dynamicUpload } from "../middlewares/upload.js";

const router = express.Router();

// upload config
const { upload, handleUpload } = dynamicUpload(
  "scholarship_exams",
  "exam_image"
);

// PUBLIC
router.get("/", getScholarshipExams);
router.get("/:id", getScholarshipExamById);

// ADMIN (FORM-DATA)
router.post(
  "/",
  verifyAccessToken,
  upload.single("exam_image"),
  handleUpload,
  createScholarshipExam
);

router.put(
  "/:id",
  verifyAccessToken,
  upload.single("exam_image"),
  handleUpload,
  updateScholarshipExam
);

router.delete("/:id", verifyAccessToken, deleteScholarshipExam);

export default router;
