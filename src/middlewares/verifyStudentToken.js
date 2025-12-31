import jwt from "jsonwebtoken";
import { STUDENT_JWT_ACCESS_SECRET } from "../config/env.js";

export const verifyStudentToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: "Student access token missing" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, STUDENT_JWT_ACCESS_SECRET);
    req.student = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Invalid or expired student token" });
  }
};
