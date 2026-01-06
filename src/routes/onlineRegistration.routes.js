import express from "express";
import {
  createRegistration,
  getRegistrations,
  getRegistrationById,
  updateRegistration,
  deleteRegistration,
  downloadOnlineRegistrationExcel,
} from "../controllers/onlineRegistration.controller.js";

import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { dynamicUpload } from "../middlewares/upload.js";

const router = express.Router();
const { upload, handleUpload } = dynamicUpload(
  "registrations",
  "student_photo"
);

router.get(
  "/download-excel",
  verifyAccessToken,
  downloadOnlineRegistrationExcel
);

router.post("/", upload.single("student_photo"), handleUpload, createRegistration);
router.get("/", getRegistrations);
router.get("/:id", getRegistrationById);
router.put("/:id", verifyAccessToken, upload.single("student_photo"), handleUpload, updateRegistration);
router.delete("/:id", verifyAccessToken, deleteRegistration);

export default router;
