import express from "express";
import {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from "../controllers/blogs.controller.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { dynamicUpload } from "../middlewares/upload.js";

const router = express.Router();
const uploadBlogImage = dynamicUpload("blogs", "blog_image");

router.post("/", verifyAccessToken, uploadBlogImage.single("blog_image"), createBlog);
router.get("/", getBlogs);
router.get("/:id", getBlogById);
router.put("/:id", verifyAccessToken, uploadBlogImage.single("blog_image"), updateBlog);
router.delete("/:id", verifyAccessToken, deleteBlog);

export default router;
