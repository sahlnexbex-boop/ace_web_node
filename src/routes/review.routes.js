import express from "express";
import {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";

import multer from "multer";

const router = express.Router();
const upload = multer();

router.post("/", verifyAccessToken, upload.none(), createReview);
router.get("/", getReviews);
router.get("/:id", getReviewById);
router.put("/:id", verifyAccessToken, upload.none(), updateReview);
router.delete("/:id", verifyAccessToken, deleteReview);

export default router;
