import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET } from "../config/env.js";

export const verifyAccessToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Access token missing" });
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
