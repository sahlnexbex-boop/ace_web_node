import express from "express";
import {
  createExamRegistration,
  getExamRegistrations,
  getExamRegistrationById,
  updateExamRegistration,
  deleteExamRegistration,
} from "../controllers/examRegistration.controller.js";

import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";

const router = express.Router();

// PUBLIC
router.post("/", createExamRegistration);

// ADMIN PROTECTED
router.get("/", verifyAccessToken, getExamRegistrations);
router.get("/:id", verifyAccessToken, getExamRegistrationById);
router.put("/:id", verifyAccessToken, updateExamRegistration);
router.delete("/:id", verifyAccessToken, deleteExamRegistration);

export default router;
