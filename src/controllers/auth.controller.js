import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";
import {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_EXPIRES,
  REFRESH_EXPIRES,
} from "../config/env.js";

// Temporary in-memory store for OTPs
const otpStore = new Map();

// helper functions
const signAccessToken = (payload) =>
  jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });

const signRefreshToken = (payload) =>
  jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });

// login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = signAccessToken({ id: user.id, email: user.email });
    const refreshToken = signRefreshToken({ id: user.id, email: user.email });

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// send otp (email verify)
export const sendResetOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // valid 5 min

    const html = `
      <h3>Password Reset OTP</h3>
      <p>Your OTP for password reset is: <b>${otp}</b></p>
      <p>This code is valid for 5 minutes.</p>
    `;

    await sendEmail(email, "Password Reset OTP", html);

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// verify otp
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!otpStore.has(email))
      return res.status(400).json({ message: "OTP not found or expired" });

    const stored = otpStore.get(email);

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP expired" });
    }

    if (stored.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    otpStore.delete(email);

    const accessToken = signAccessToken({ email });
    const refreshToken = signRefreshToken({ email });

    res.json({
      message: "OTP verified successfully",
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// reset pass
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword)
      return res.status(400).json({ message: "Email and new password required" });

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.updated_at = new Date();
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// refresh token 
export const refreshAccessToken = (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ message: "Refresh token missing" });

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid refresh token" });

      const accessToken = signAccessToken({ id: decoded.id, email: decoded.email });
      res.json({ accessToken });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
