import express from "express";
import {
  createEnquiry,
  getEnquiries,
  getSingleEnquiry,
  updateEnquiry,
  deleteEnquiry,
} from "../controllers/enquiry.controller.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";

const router = express.Router();

router.post("/", createEnquiry);
router.get("/", verifyAccessToken, getEnquiries);
router.get("/:id", verifyAccessToken, getSingleEnquiry);
router.put("/:id", verifyAccessToken, updateEnquiry);
router.delete("/:id", verifyAccessToken, deleteEnquiry);

export default router;
