import express from "express";
import {
  createWebinar,
  getWebinars,
  getWebinarById,
  updateWebinar,
  deleteWebinar,
} from "../controllers/webinar.controller.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { dynamicUpload } from "../middlewares/upload.js";

const router = express.Router();

const {upload, compressFile} = dynamicUpload("webinars", "webinar_image");

router.post("/", verifyAccessToken, upload.single("webinar_image"), compressFile, createWebinar);
router.get("/", getWebinars);
router.get("/:id", getWebinarById);
router.put("/:id", verifyAccessToken, upload.single("webinar_image"), compressFile, updateWebinar);
router.delete("/:id", verifyAccessToken, deleteWebinar);

export default router;
