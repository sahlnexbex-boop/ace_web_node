import express from "express";
import {
  createStudyService,
  getStudyServices,
  getStudyServiceById,
  updateStudyService,
  deleteStudyService,
} from "../controllers/studyService.controller.js";

import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { dynamicUpload } from "../middlewares/upload.js";

const router = express.Router();
const {upload,handleUpload} = dynamicUpload("study_services", "service_file");

router.post("/", verifyAccessToken, upload.single("service_file"),handleUpload, createStudyService);
router.get("/", getStudyServices);
router.get("/:id", getStudyServiceById);
router.put("/:id", verifyAccessToken, upload.single("service_file"),handleUpload, updateStudyService);
router.delete("/:id", verifyAccessToken, deleteStudyService);

export default router;
