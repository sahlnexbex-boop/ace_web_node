import express from "express";
import {
  createResult,
  getResults,
  getResultById,
  updateResult,
  deleteResult,
} from "../controllers/result.controller.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { dynamicUpload } from "../middlewares/upload.js";

const router = express.Router();

const { upload,handleUpload, } = dynamicUpload("results", "result_file");

router.post("/", verifyAccessToken, upload.single("result_file"),handleUpload, createResult);
router.get("/", getResults);
router.get("/:id", getResultById);
router.put("/:id", verifyAccessToken, upload.single("result_file"),handleUpload, updateResult);
router.delete("/:id", verifyAccessToken, deleteResult);

export default router;
