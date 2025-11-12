import express from "express";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { dynamicUpload } from "../middlewares/upload.js";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/courseCategory.controller.js";

const router = express.Router();

const { upload,handleUpload, } = dynamicUpload("course_category", "category_image");

router.post(
  "/",
  verifyAccessToken,
  upload.single("category_image"),
 handleUpload,
  createCategory
);
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.put(
  "/:id",
  verifyAccessToken,
  upload.single("category_image"),
 handleUpload,
  updateCategory
);
router.delete("/:id", verifyAccessToken, deleteCategory);

export default router;
