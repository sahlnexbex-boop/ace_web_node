import express from "express";
import {
  createTution,
  getTutions,
  getTutionById,
  updateTution,
  deleteTution,
} from "../controllers/tution.controller.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { dynamicUpload } from "../middlewares/upload.js";

const router = express.Router();
const { upload, handleUpload } = dynamicUpload("tutions", "tution_image");

router.post(
  "/",
  verifyAccessToken,
  upload.single("tution_image"),
  handleUpload,
  createTution
);
router.get("/", getTutions);
router.get("/:id", getTutionById);
router.put(
  "/:id",
  verifyAccessToken,
  upload.single("tution_image"),
  handleUpload,
  updateTution
);
router.delete("/:id", verifyAccessToken, deleteTution);

export default router;

