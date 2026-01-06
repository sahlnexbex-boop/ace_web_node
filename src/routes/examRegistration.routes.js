import express from "express";
import {
  createExamRegistration,
  getExamRegistrations,
  getExamRegistrationById,
  updateExamRegistration,
  deleteExamRegistration,
  generateHallTicket,
  downloadExamRegistrationExcel,
} from "../controllers/examRegistration.controller.js";

import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { verifyStudentToken } from "../middlewares/verifyStudentToken.js";

const router = express.Router();

// PUBLIC
router.post("/", createExamRegistration);

// generate hall ticket
router.get("/hallticket/:id", generateHallTicket);

// excel- download
router.get(
  "/download-excel",
  verifyAccessToken,
  downloadExamRegistrationExcel
);

// ADMIN PROTECTED
router.get("/", getExamRegistrations);
router.get("/:id", verifyAccessToken, getExamRegistrationById);
router.put("/:id", verifyAccessToken, updateExamRegistration);
router.delete("/:id", verifyAccessToken, deleteExamRegistration);

export default router;
