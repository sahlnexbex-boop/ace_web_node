import express from "express";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { dynamicUpload } from "../middlewares/upload.js";

import {
  createRankHolder,
  getRankHolders,
  getRankHolderById,
  updateRankHolder,
  deleteRankHolder,
} from "../controllers/rankHolders.controller.js";

const router = express.Router();

const { upload,handleUpload} = dynamicUpload("rank_holders", "student_photo");

router.post("/", upload.single("student_photo"),handleUpload, createRankHolder);
router.get("/", getRankHolders);
router.get("/:id", getRankHolderById);
router.put("/:id", verifyAccessToken, upload.single("student_photo"),handleUpload, updateRankHolder);
router.delete("/:id", verifyAccessToken, deleteRankHolder);

export default router;
