import express from "express";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCourseBySlug,
  createFullCourse,
  updateFullCourse,
} from "../controllers/course.controller.js";
import { dynamicUpload } from "../middlewares/upload.js";

const router = express.Router();

const { upload,handleUpload, } = dynamicUpload("course", "course_file");
const courseUpload = upload.fields([
  { name: "course_image", maxCount: 1 },
  { name: "course_syllabus_file", maxCount: 1 },
  { name: "course_questions_file", maxCount: 1 },
]);

router.post("/", verifyAccessToken, courseUpload,handleUpload, createCourse);
router.post("/full", verifyAccessToken, courseUpload, handleUpload, createFullCourse);
router.put("/full/:id", verifyAccessToken, courseUpload, handleUpload, updateFullCourse);
router.get("/", getCourses);
router.get("/:id", getCourseById);
router.get("/slug/:slug", getCourseBySlug);
router.put("/:id", verifyAccessToken, courseUpload,handleUpload, updateCourse);
router.delete("/:id", verifyAccessToken, deleteCourse);

export default router;
