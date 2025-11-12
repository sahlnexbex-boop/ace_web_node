import express from "express";
import {
  createVideoClass,
  getVideoClasses,
  getVideoClassById,
  updateVideoClass,
  deleteVideoClass,
} from "../controllers/videoClass.controller.js";

import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { dynamicUpload } from "../middlewares/upload.js";

const router = express.Router();
const { upload,handleUpload} = dynamicUpload("video_classes", "class_image");

router.post("/", verifyAccessToken, upload.single("class_image"),handleUpload, createVideoClass);
router.get("/", getVideoClasses);
router.get("/:id", getVideoClassById);
router.put("/:id", verifyAccessToken, upload.single("class_image"),handleUpload, updateVideoClass);
router.delete("/:id", verifyAccessToken, deleteVideoClass);

export default router;
