import express from "express";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
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
router.get("/", getCourses);
router.get("/:id", getCourseById);
router.put("/:id", verifyAccessToken, courseUpload,handleUpload, updateCourse);
router.delete("/:id", verifyAccessToken, deleteCourse);

export default router;
