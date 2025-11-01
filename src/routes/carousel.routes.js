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
const {upload, compressFile} = dynamicUpload("carousel", "carousel_file");

router.post("/", verifyAccessToken,  upload.fields([
    { name: "carousel_file", maxCount: 1 },
    { name: "carousel_mobile_file", maxCount: 1 },
  ]), compressFile, createCarousel);
router.get("/", getAllCarousels);
router.get("/:id", getCarouselById);
router.put("/:id", verifyAccessToken,  upload.fields([
    { name: "carousel_file", maxCount: 1 },
    { name: "carousel_mobile_file", maxCount: 1 },
  ]), compressFile, updateCarousel);
router.delete("/:id", verifyAccessToken, deleteCarousel);

export default router;
