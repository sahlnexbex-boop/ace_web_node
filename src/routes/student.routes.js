import express from "express";
import {
  createStudent,
  listStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  createRegistrationRequest,
} from "../controllers/student.controller.js";

import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
// import { verifyStudentToken } from "../middlewares/verifyStudentToken.js";
import {verifyAccessOrStudentToken } from "../middlewares/verifyAccessOrStudentToken.js"
import { dynamicUpload } from "../middlewares/upload.js";

const router = express.Router();

// setup upload
const { upload, handleUpload } = dynamicUpload("students", "std_photo");
const { upload: regUpload, handleUpload: regHandleUpload } = dynamicUpload(
  "registrations",
  "student_photo"
);

router.post(
  "/",
  verifyAccessToken,
  upload.single("std_photo"),
  handleUpload,
  createStudent
);

router.get("/", verifyAccessToken, listStudents);

router.get("/:id", verifyAccessOrStudentToken, getStudentById);

router.put(
  "/:id",
  verifyAccessToken,
  upload.single("std_photo"),
  handleUpload,
  updateStudent
);

router.delete("/:id", verifyAccessToken, deleteStudent);

// Registration requests
router.post(
  "/registration-requests",
  regUpload.single("student_photo"),
  regHandleUpload,
  createRegistrationRequest
);

router.post(
  "/registration-requests/",
  regUpload.single("student_photo"),
  regHandleUpload,
  createRegistrationRequest
);

export default router;
