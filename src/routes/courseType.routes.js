import express from "express";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import {
  createCourseType,
  getCourseTypes,
  getCourseTypeById,
  updateCourseType,
  deleteCourseType,
} from "../controllers/courseType.controller.js";

const router = express.Router();

router.post("/", verifyAccessToken, createCourseType);
router.get("/", getCourseTypes);
router.get("/:id", getCourseTypeById);
router.put("/:id", verifyAccessToken, updateCourseType);
router.delete("/:id", verifyAccessToken, deleteCourseType);

export default router;
