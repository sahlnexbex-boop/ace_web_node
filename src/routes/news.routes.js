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
const uploadNewsImage = dynamicUpload("news", "news_image");

router.post("/", verifyAccessToken, uploadNewsImage.single("news_image"), createNews);
router.get("/", getAllNews);
router.get("/:id", getNewsById);
router.put("/:id", verifyAccessToken, uploadNewsImage.single("news_image"), updateNews);
router.delete("/:id", verifyAccessToken, deleteNews);

export default router;
