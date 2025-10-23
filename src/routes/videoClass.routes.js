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
const uploadVideoClassImage = dynamicUpload("video_classes", "class_image");

router.post("/", verifyAccessToken, uploadVideoClassImage.single("class_image"), createVideoClass);
router.get("/", getVideoClasses);
router.get("/:id", getVideoClassById);
router.put("/:id", verifyAccessToken, uploadVideoClassImage.single("class_image"), updateVideoClass);
router.delete("/:id", verifyAccessToken, deleteVideoClass);

export default router;
