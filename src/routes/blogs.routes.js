import express from "express";
import {
  createBlog,
  getBlogs,
  updateBlog,
  deleteBlog,
  getBlogBySlug,
  getBlogById,
} from "../controllers/blogs.controller.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { dynamicUpload } from "../middlewares/upload.js";

const router = express.Router();
const { upload,handleUpload, } = dynamicUpload("blogs", "blog_image");

router.post("/", verifyAccessToken, upload.single("blog_image"),handleUpload, createBlog);
router.get("/", getBlogs);
router.get("/:id", getBlogById);
router.get("/slug/:slug", getBlogBySlug);
router.put("/:id", verifyAccessToken, upload.single("blog_image"),handleUpload, updateBlog);
router.delete("/:id", verifyAccessToken, deleteBlog);

export default router;
