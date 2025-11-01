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

const { upload, compressFile, } = dynamicUpload("success_stories", "thumbnail_image");

router.post("/", verifyAccessToken, upload.single("thumbnail_image"), compressFile, createSuccessStory);
router.get("/", getSuccessStories);
router.get("/:id", getSuccessStoryById);
router.put("/:id", verifyAccessToken, upload.single("thumbnail_image"), compressFile, updateSuccessStory);
router.delete("/:id", verifyAccessToken, deleteSuccessStory);

export default router;
