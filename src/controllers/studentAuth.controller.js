import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Student from "../models/student.model.js";
import sendEmail from "../utils/sendEmail.js";
import {
  STUDENT_JWT_ACCESS_SECRET,
  STUDENT_JWT_REFRESH_SECRET,
  STUDENT_ACCESS_EXPIRES,
  STUDENT_REFRESH_EXPIRES,
} from "../config/env.js";

const otpStore = new Map();

const signAccessToken = (payload) =>
  jwt.sign(payload, STUDENT_JWT_ACCESS_SECRET, {
    expiresIn: STUDENT_ACCESS_EXPIRES,
  });

const signRefreshToken = (payload) =>
  jwt.sign(payload, STUDENT_JWT_REFRESH_SECRET, {
    expiresIn: STUDENT_REFRESH_EXPIRES,
  });

// STUDENT LOGIN 
export const studentLogin = async (req, res) => {
  try {
    const { std_email, password } = req.body;

    if (!std_email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const student = await Student.findOne({ where: { std_email } });
    if (!student)
      return res.status(404).json({ message: "Student not found" });

    if (student.status === 0)
      return res.status(401).json({ message: "Student is inactive" });

    const match = await bcrypt.compare(password, student.password);
    if (!match)
      return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = signAccessToken({
      std_id: student.std_id,
      std_email: student.std_email,
    });

    const refreshToken = signRefreshToken({
      std_id: student.std_id,
      std_email: student.std_email,
    });

    res.json({
      message: "Student login successful",
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// STUDENT SIGNUP
export const studentSignup = async (req, res) => {
  try {
    const data = req.body;

    const exists = await Student.findOne({
      where: { std_email: data.std_email },
    });

    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const student = await Student.create(data);
    const { password, ...clean } = student.toJSON();

    res.status(201).json({
      message: "Student registered successfully",
      data: clean,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  SEND OTP
export const sendStudentOTP = async (req, res) => {
  const { std_email } = req.body;

  const student = await Student.findOne({ where: { std_email } });
  if (!student)
    return res.status(404).json({ message: "Student not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(std_email, { otp, expires: Date.now() + 5 * 60000 });

  await sendEmail(
    std_email,
    "Student Password Reset OTP",
    `<h3>Your OTP: ${otp}</h3><p>Valid for 5 minutes</p>`
  );

  res.json({ message: "OTP sent to student email" });
};

//  VERIFY OTP
export const verifyStudentOTP = async (req, res) => {
  const { std_email, otp } = req.body;

  const stored = otpStore.get(std_email);
  if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  otpStore.delete(std_email);

  const accessToken = signAccessToken({ std_email });
  const refreshToken = signRefreshToken({ std_email });

  res.json({
    message: "OTP verified",
    accessToken,
    refreshToken,
  });
};

//  RESET PASSWORD
export const resetStudentPassword = async (req, res) => {
  const { std_email, newPassword } = req.body;

  const student = await Student.findOne({ where: { std_email } });
  if (!student)
    return res.status(404).json({ message: "Student not found" });

  student.password = newPassword;
  student.updated_at = new Date();
  await student.save();

  res.json({ message: "Password reset successful" });
};

// REFRESH TOKEN
export const refreshStudentToken = (req, res) => {
  const { refreshToken } = req.body;

  jwt.verify(
    refreshToken,
    STUDENT_JWT_REFRESH_SECRET,
    (err, decoded) => {
      if (err)
        return res.status(403).json({ message: "Invalid refresh token" });

      const accessToken = signAccessToken({
        std_id: decoded.std_id,
        std_email: decoded.std_email,
      });

      res.json({ accessToken });
    }
  );
};
