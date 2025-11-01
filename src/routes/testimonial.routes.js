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

const { upload, compressFile} = dynamicUpload("testimonials", "image_of_candidate");

router.post("/", verifyAccessToken, upload.single("image_of_candidate"), compressFile, createTestimonial);
router.get("/", getTestimonials);
router.get("/:id", getTestimonialById);
router.put("/:id", verifyAccessToken, upload.single("image_of_candidate"), compressFile, updateTestimonial);
router.delete("/:id", verifyAccessToken, deleteTestimonial);

export default router;
