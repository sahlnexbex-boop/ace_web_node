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

const upload = dynamicUpload("course", "course_file");
const courseUpload = upload.fields([
  { name: "course_image", maxCount: 1 },
  { name: "course_syllabus_file", maxCount: 1 },
  { name: "course_questions_file", maxCount: 1 },
]);

router.post("/", verifyAccessToken, courseUpload, createCourse);
router.get("/", getCourses);
router.get("/:id", getCourseById);
router.put("/:id", verifyAccessToken, courseUpload, updateCourse);
router.delete("/:id", verifyAccessToken, deleteCourse);

export default router;
