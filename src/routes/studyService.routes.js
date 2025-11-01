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
const {upload, compressFile} = dynamicUpload("study_services", "service_file");

router.post("/", verifyAccessToken, upload.single("service_file"), compressFile, createStudyService);
router.get("/", getStudyServices);
router.get("/:id", getStudyServiceById);
router.put("/:id", verifyAccessToken, upload.single("service_file"), compressFile, updateStudyService);
router.delete("/:id", verifyAccessToken, deleteStudyService);

export default router;
