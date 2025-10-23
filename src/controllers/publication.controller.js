import { Op } from "sequelize";
import Book from "../models/publication.model.js";
import CourseCategory from "../models/courseCategory.model.js";
import { deleteFile } from "../utils/fileHelper.js";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

// create
export const createBook = async (req, res) => {
  try {
    const {
      book_title,
      book_description,
      book_price,
      book_author,
      book_language,
      category_id,
      status,
    } = req.body;

    const book_image = req.files?.book_image
      ? `${SERVER_URL}/uploads/books/${req.files.book_image[0].filename}`
      : null;

    const book_file = req.files?.book_file
      ? `${SERVER_URL}/uploads/books/${req.files.book_file[0].filename}`
      : null;

    if (!book_title || !category_id) {
      return res.status(400).json({
        message: "Missing required fields: book_title, category_id",
      });
    }

    if (category_id) {
      const categoryExists = await CourseCategory.findByPk(category_id);
      if (!categoryExists)
        return res.status(400).json({ message: "Invalid course_category_id" });
    }

    const newBook = await Book.create({
      book_title,
      book_description,
      book_price,
      book_author,
      book_language,
      category_id,
      book_image,
      book_file,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    res
      .status(201)
      .json({ message: "Book created successfully", data: newBook });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// list
export const getBooks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      category_id,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) where.book_title = { [Op.like]: `%${search}%` };
    if (status && [0, 1].includes(Number(status)))
      where.status = Number(status);
    if (category_id) where.category_id = category_id;

    const { rows, count } = await Book.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["book_id", "DESC"]],
    });

    res.json({
      message: "Books fetched successfully",
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// single
export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    res.json({ message: "Book fetched successfully", data: book });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update
export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      book_title,
      book_description,
      book_price,
      book_author,
      book_language,
      category_id,
      status,
    } = req.body;

    const book = await Book.findByPk(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

     if (category_id) {
      const categoryExists = await CourseCategory.findByPk(category_id);
      if (!categoryExists)
        return res.status(400).json({ message: "Invalid course_category_id" });
    }

    const newImage = req.files?.book_image
      ? `${SERVER_URL}/uploads/books/${req.files.book_image[0].filename}`
      : null;

    const newFile = req.files?.book_file
      ? `${SERVER_URL}/uploads/books/${req.files.book_file[0].filename}`
      : null;

    if (newImage && book.book_image) deleteFile(book.book_image);
    if (newFile && book.book_file) deleteFile(book.book_file);

    book.book_title = book_title || book.book_title;
    book.book_description = book_description || book.book_description;
    book.book_price = book_price || book.book_price;
    book.book_author = book_author || book.book_author;
    book.book_language = book_language || book.book_language;
    book.category_id = category_id || book.category_id;
    book.status = [0, 1].includes(Number(status))
      ? Number(status)
      : book.status;
    book.book_image = newImage || book.book_image;
    book.book_file = newFile || book.book_file;
    book.updated_by = req.user?.user_id || 0;
    book.updated_at = new Date();

    await book.save();

    res.json({ message: "Book updated successfully", data: book });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (book.book_image) deleteFile(book.book_image);
    if (book.book_file) deleteFile(book.book_file);

    await book.destroy();
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
