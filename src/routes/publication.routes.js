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
const {upload,handleUpload} = dynamicUpload("books", ["book_image", "book_file"]);

router.post("/", verifyAccessToken, upload.fields([
  { name: "book_image", maxCount: 1 },
  { name: "book_file", maxCount: 1 },
]),handleUpload, createBook);

router.get("/", getBooks);
router.get("/:id", getBookById);

router.put("/:id", verifyAccessToken, upload.fields([
  { name: "book_image", maxCount: 1 },
  { name: "book_file", maxCount: 1 },
]),handleUpload, updateBook);

router.delete("/:id", verifyAccessToken, deleteBook);

export default router;
