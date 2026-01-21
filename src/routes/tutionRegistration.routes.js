import express from "express";
import {
  createTutionRegistration,
  getTutionRegistrations,
  getTutionRegistrationById,
  updateTutionRegistration,
  deleteTutionRegistration,
  downloadTutionRegistrationExcel,
} from "../controllers/tutionRegistration.controller.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";

const router = express.Router();

// Excel download
router.get(
  "/download-excel",
  verifyAccessToken,
  downloadTutionRegistrationExcel
);

// Public create (if you want it protected, add verifyAccessToken here)
router.post("/", createTutionRegistration);

// Admin-protected list and detail / updates
router.get("/", verifyAccessToken, getTutionRegistrations);
router.get("/:id", verifyAccessToken, getTutionRegistrationById);
router.put("/:id", verifyAccessToken, updateTutionRegistration);
router.delete("/:id", verifyAccessToken, deleteTutionRegistration);

export default router;

