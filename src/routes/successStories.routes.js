import express from "express";
import {
  createSuccessStory,
  getSuccessStories,
  getSuccessStoryById,
  updateSuccessStory,
  deleteSuccessStory,
} from "../controllers/successStories.controller.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { dynamicUpload } from "../middlewares/upload.js";

const router = express.Router();

const uploadThumbnail = dynamicUpload("success_stories", "thumbnail_image");

router.post("/", verifyAccessToken, uploadThumbnail.single("thumbnail_image"), createSuccessStory);
router.get("/", verifyAccessToken, getSuccessStories);
router.get("/:id", verifyAccessToken, getSuccessStoryById);
router.put("/:id", verifyAccessToken, uploadThumbnail.single("thumbnail_image"), updateSuccessStory);
router.delete("/:id", verifyAccessToken, deleteSuccessStory);

export default router;
