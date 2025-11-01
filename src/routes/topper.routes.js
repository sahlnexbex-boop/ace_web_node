import express from "express";
import {
  createTopper,
  getToppers,
  getTopperById,
  updateTopper,
  deleteTopper,
} from "../controllers/topper.controller.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { dynamicUpload } from "../middlewares/upload.js";

const router = express.Router();

const {upload, compressFile} = dynamicUpload("toppers", "topper_image");

router.post("/", verifyAccessToken, upload.single("topper_image"), compressFile, createTopper);
router.get("/", getToppers);
router.get("/:id", getTopperById);
router.put("/:id", verifyAccessToken, upload.single("topper_image"), compressFile, updateTopper);
router.delete("/:id", verifyAccessToken, deleteTopper);

export default router;
