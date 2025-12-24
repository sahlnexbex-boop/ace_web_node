import express from "express";
import {
  createRankForum,
  getRankForums,
  getRankForumById,
  updateRankForum,
  deleteRankForum,
} from "../controllers/rankForum.controller.js";

import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { dynamicUpload } from "../middlewares/upload.js";

const router = express.Router();
const { upload, handleUpload } = dynamicUpload("rankforum", "photo");

router.post(
  "/",
  upload.single("photo"),
  handleUpload,
  createRankForum
);

router.get("/", verifyAccessToken, getRankForums);
router.get("/:id", verifyAccessToken,getRankForumById);

router.put(
  "/:id",
  verifyAccessToken,
  upload.single("photo"),
  handleUpload,
  updateRankForum
);

router.delete("/:id", verifyAccessToken, deleteRankForum);

export default router;
