import express from "express";
import {
  studentLogin,
  studentSignup,
  sendStudentOTP,
  verifyStudentOTP,
  resetStudentPassword,
  refreshStudentToken,
} from "../controllers/studentAuth.controller.js";

import { verifyStudentToken } from "../middlewares/verifyStudentToken.js";

const router = express.Router();

router.post("/signup", studentSignup);
router.post("/login", studentLogin);
router.post("/send-otp", sendStudentOTP);
router.post("/verify-otp", verifyStudentOTP);
router.post("/reset-password", verifyStudentToken, resetStudentPassword);
router.post("/refresh-token", refreshStudentToken);

router.get("/verify-token", verifyStudentToken, (req, res) => {
  res.json({ valid: true, student: req.student });
});

export default router;
