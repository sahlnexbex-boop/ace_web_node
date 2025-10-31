import express from "express";
import {
  createShort,
  getAllShorts,
  getShortById,
  updateShort,
  deleteShort,
} from "../controllers/shorts.controller.js";
import { dynamicUpload } from "../middlewares/upload.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";

const router = express.Router();
const uploadShorts = dynamicUpload("shorts", "shorts_file");

router.post("/", verifyAccessToken, uploadShorts.single("shorts_file"), createShort);
router.get("/", getAllShorts);
router.get("/:id", getShortById);
router.put("/:id", verifyAccessToken, uploadShorts.single("shorts_file"), updateShort);
router.delete("/:id", verifyAccessToken, deleteShort);

export default router;
