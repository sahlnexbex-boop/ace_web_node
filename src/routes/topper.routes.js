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

const uploadTopperImage = dynamicUpload("toppers", "topper_image");

router.post("/", verifyAccessToken, uploadTopperImage.single("topper_image"), createTopper);
router.get("/", getToppers);
router.get("/:id", getTopperById);
router.put("/:id", verifyAccessToken, uploadTopperImage.single("topper_image"), updateTopper);
router.delete("/:id", verifyAccessToken, deleteTopper);

export default router;
