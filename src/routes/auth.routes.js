import express from "express";
import {
  login,
  sendResetOTP,
  verifyOTP,
  resetPassword,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";

const router = express.Router();

router.post("/login", login);
router.post("/send-otp", sendResetOTP);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", verifyAccessToken, resetPassword);
router.post("/refresh-token", refreshAccessToken);

export default router;
