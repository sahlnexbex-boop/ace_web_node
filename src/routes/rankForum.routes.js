import express from "express";
import {
  createRankForum,
  getRankForums,
  getRankForumById,
  updateRankForum,
  deleteRankForum,
} from "../controllers/rankForum.controller.js";

import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import multer from "multer";

const router = express.Router();

//  Multer for FormData (NO FILES)
const upload = multer();

router.post("/", upload.none(), createRankForum);
router.get("/", verifyAccessToken, getRankForums);
router.get("/:id", verifyAccessToken, getRankForumById);
router.put("/:id", verifyAccessToken, upload.none(), updateRankForum);
router.delete("/:id", verifyAccessToken, deleteRankForum);

export default router;
