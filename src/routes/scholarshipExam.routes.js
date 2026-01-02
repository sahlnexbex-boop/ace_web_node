import express from "express";
import {
  createScholarshipExam,
  getScholarshipExams,
  getScholarshipExamById,
  updateScholarshipExam,
  deleteScholarshipExam,
} from "../controllers/scholarshipExam.controller.js";

import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";

const router = express.Router();

// PUBLIC
router.get("/", getScholarshipExams);
router.get("/:id", getScholarshipExamById);

// ADMIN PROTECTED
router.post("/", verifyAccessToken, createScholarshipExam);
router.put("/:id", verifyAccessToken, updateScholarshipExam);
router.delete("/:id", verifyAccessToken, deleteScholarshipExam);

export default router;
