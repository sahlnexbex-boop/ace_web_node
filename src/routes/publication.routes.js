import express from "express";
import {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
} from "../controllers/publication.controller.js";

import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { dynamicUpload } from "../middlewares/upload.js";

const router = express.Router();
const uploadBookFiles = dynamicUpload("books", ["book_image", "book_file"]);

router.post("/", verifyAccessToken, uploadBookFiles.fields([
  { name: "book_image", maxCount: 1 },
  { name: "book_file", maxCount: 1 },
]), createBook);

router.get("/", getBooks);
router.get("/:id", getBookById);

router.put("/:id", verifyAccessToken, uploadBookFiles.fields([
  { name: "book_image", maxCount: 1 },
  { name: "book_file", maxCount: 1 },
]), updateBook);

router.delete("/:id", verifyAccessToken, deleteBook);

export default router;
