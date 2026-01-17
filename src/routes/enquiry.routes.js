import express from "express";
import {
  createEnquiry,
  getEnquiries,
  getSingleEnquiry,
  updateEnquiry,
  deleteEnquiry,
  downloadEnquiryExcel,
} from "../controllers/enquiry.controller.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";

const router = express.Router();

// Excel download
router.get(
  "/download-excel",
  verifyAccessToken,
  downloadEnquiryExcel
);

router.post("/", createEnquiry);
router.get("/", getEnquiries);
router.get("/:id", getSingleEnquiry);
router.put("/:id", verifyAccessToken, updateEnquiry);
router.delete("/:id", verifyAccessToken, deleteEnquiry);

export default router;
