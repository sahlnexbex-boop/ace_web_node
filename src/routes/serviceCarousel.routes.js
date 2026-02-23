import express from "express";
import {
  createServiceCarousel,
  getServiceCarousels,
  getServiceCarouselById,
  bulkDeleteServiceCarousel,
  bulkStatusUpdate,
} from "../controllers/serviceCarousel.controller.js";

import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { dynamicUpload } from "../middlewares/upload.js";

const router = express.Router();
const { upload, handleUpload } = dynamicUpload(
  "service_carousel",
  "image_url"
);

router.post(
  "/",
  verifyAccessToken,
  upload.array("image_url", 10),
  handleUpload,
  createServiceCarousel
);
router.get("/", getServiceCarousels);
router.get("/:id", getServiceCarouselById);
router.post("/bulk-delete", verifyAccessToken, bulkDeleteServiceCarousel);
router.post("/bulk-status", verifyAccessToken, bulkStatusUpdate);

export default router;