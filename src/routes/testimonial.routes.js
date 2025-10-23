import express from "express";
import {
  createTestimonial,
  getTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
} from "../controllers/testimonial.controller.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { dynamicUpload } from "../middlewares/upload.js";

const router = express.Router();

const uploadTestimonialImage = dynamicUpload("testimonials", "image_of_candidate");

router.post("/", verifyAccessToken, uploadTestimonialImage.single("image_of_candidate"), createTestimonial);
router.get("/", getTestimonials);
router.get("/:id", getTestimonialById);
router.put("/:id", verifyAccessToken, uploadTestimonialImage.single("image_of_candidate"), updateTestimonial);
router.delete("/:id", verifyAccessToken, deleteTestimonial);

export default router;
