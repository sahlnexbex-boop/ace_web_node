import express from "express";
import {
  createBlog,
  getBlogs,
  updateBlog,
  deleteBlog,
  getBlogBySlug,
  getBlogById,
  uploadBlogImage,
  cleanupEditorImages,
} from "../controllers/blogs.controller.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { dynamicUpload } from "../middlewares/upload.js";
import { editorUpload } from "../middlewares/editorUpload.js";

const router = express.Router();
const { upload, handleUpload } = dynamicUpload("blogs", "blog_image");

router.post(
  "/",
  verifyAccessToken,
  upload.single("blog_image"),
  handleUpload,
  createBlog
);
router.get("/", getBlogs);
router.get("/:id", getBlogById);
router.get("/slug/:slug", getBlogBySlug);
router.put(
  "/:id",
  verifyAccessToken,
  upload.single("blog_image"),
  handleUpload,
  updateBlog
);
router.delete("/:id", verifyAccessToken, deleteBlog);

router.post(
  "/upload-editor-image",
  (req, res, next) => {
    editorUpload.single("upload")(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({
          error: err.message,
          uploaded: false,
        });
      }
      next();
    });
  },
  uploadBlogImage
);

// Cleanup endpoint for unused images
router.post("/cleanup-editor-images", cleanupEditorImages);

export default router;
