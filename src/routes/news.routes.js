import express from "express";
import {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
} from "../controllers/news.controller.js";
import { dynamicUpload } from "../middlewares/upload.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";

const router = express.Router();
const { upload, compressFile} = dynamicUpload("news", "news_image");

router.post("/", verifyAccessToken, upload.single("news_image"), compressFile, createNews);
router.get("/", getAllNews);
router.get("/:id", getNewsById);
router.put("/:id", verifyAccessToken, upload.single("news_image"), compressFile, updateNews);
router.delete("/:id", verifyAccessToken, deleteNews);

export default router;
