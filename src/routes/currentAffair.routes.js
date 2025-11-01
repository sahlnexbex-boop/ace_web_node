import express from "express";
import {
  createCurrentAffair,
  getCurrentAffairs,
  getCurrentAffairById,
  updateCurrentAffair,
  deleteCurrentAffair,
} from "../controllers/currentAffair.controller.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { dynamicUpload } from "../middlewares/upload.js";

const router = express.Router();
const {upload, compressFile} = dynamicUpload("current_affairs", "affair_file");

router.post("/", verifyAccessToken, upload.single("affair_file"), compressFile, createCurrentAffair);
router.get("/", getCurrentAffairs);
router.get("/:id", getCurrentAffairById);
router.put("/:id", verifyAccessToken, upload.single("affair_file"), compressFile, updateCurrentAffair);
router.delete("/:id", verifyAccessToken, deleteCurrentAffair);

export default router;
