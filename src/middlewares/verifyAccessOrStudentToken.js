import jwt from "jsonwebtoken";
import { verifyAccessToken } from "./verifyAccessToken.js";
import { verifyStudentToken } from "./verifyStudentToken.js";

export const verifyAccessOrStudentToken = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  const token = header.split(" ")[1];

  // Decode WITHOUT verifying (safe operation)
  const decoded = jwt.decode(token);

  if (!decoded) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  if (decoded.std_id) {
    //  Student token
    return verifyStudentToken(req, res, next);
  }

  if (decoded.user_id || decoded.role) {
    //  Admin / Staff token
    return verifyAccessToken(req, res, next);
  }

  return res.status(401).json({ message: "Unauthorized token type" });
};
