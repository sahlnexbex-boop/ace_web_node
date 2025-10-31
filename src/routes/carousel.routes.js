import express from "express";
import {
  createCarousel,
  getAllCarousels,
  getCarouselById,
  updateCarousel,
  deleteCarousel,
} from "../controllers/carousel.controller.js";
import { dynamicUpload } from "../middlewares/upload.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";

const router = express.Router();
const uploadCarousel = dynamicUpload("carousel", "carousel_file");

router.post("/", verifyAccessToken, uploadCarousel.single("carousel_file"), createCarousel);
router.get("/", getAllCarousels);
router.get("/:id", getCarouselById);
router.put("/:id", verifyAccessToken, uploadCarousel.single("carousel_file"), updateCarousel);
router.delete("/:id", verifyAccessToken, deleteCarousel);

export default router;
