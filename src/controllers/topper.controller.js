import Topper from "../models/topper.model.js";
import Course from "../models/course.model.js";
import CourseCategory from "../models/courseCategory.model.js";
import { Op } from "sequelize";
import { deleteFile } from "../utils/fileHelper.js";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

const isUnsupportedFile = (mimetype) => {
  return !mimetype.startsWith("image/");
};

// create
export const createTopper = async (req, res) => {
  try {
    const { topper_name, topper_rank, year, exam_name, category_id, status } = req.body;

    const topper_image = req.file
      ? `${SERVER_URL}/uploads/toppers/${req.file.filename}`
      : null;

    if (req.file && isUnsupportedFile(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Only images allowed." });
    }

    // required fields
    if (!topper_name || !topper_rank || !year || !exam_name || !category_id)
      return res.status(400).json({ message: "Missing required fields" });

    // validate category
    const categoryExists = await CourseCategory.findByPk(category_id);
    if (!categoryExists) return res.status(400).json({ message: "Invalid category_id" });

    const topper = await Topper.create({
      topper_name,
      topper_rank,
      year,
      exam_name,
      category_id,
      topper_image,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({ message: "Topper created successfully", data: topper });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// list
export const getToppers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status, category_id, year } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) where.topper_name = { [Op.like]: `%${search}%` };
    if (status && [0, 1].includes(Number(status))) where.status = Number(status);
    if (category_id) where.category_id = category_id;
    if (year) where.year = year;

    const { rows, count } = await Topper.findAndCountAll({
      where,
      include: [
        { model: CourseCategory, as: "category", attributes: ["category_id", "category_name"] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["topper_id", "DESC"]],
    });

    res.json({
      message: "Toppers fetched successfully",
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Single
export const getTopperById = async (req, res) => {
  try {
    const { id } = req.params;

    const topper = await Topper.findByPk(id, {
      include: [
        {
          model: CourseCategory,
          as: "category",
          attributes: ["category_id", "category_name"],
        },
      ],
    });

    if (!topper)
      return res.status(404).json({ message: "Topper not found" });

    res.json({
      message: "Topper fetched successfully",
      data: topper,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
export const updateTopper = async (req, res) => {
  try {
    const { id } = req.params;
    const { topper_name, topper_rank, year, exam_name, category_id, status } = req.body;

    const newImage = req.file
      ? `${SERVER_URL}/uploads/toppers/${req.file.filename}`
      : null;

    if (req.file && isUnsupportedFile(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Only images allowed." });
    }

    const topper = await Topper.findByPk(id);
    if (!topper) return res.status(404).json({ message: "Topper not found" });

    if (category_id) {
      const categoryExists = await CourseCategory.findByPk(category_id);
      if (!categoryExists) return res.status(400).json({ message: "Invalid category_id" });
    }

    // delete old image
    if (newImage && topper.topper_image) deleteFile(topper.topper_image);

    topper.topper_name = topper_name || topper.topper_name;
    topper.topper_rank = topper_rank || topper.topper_rank;
    topper.year = year || topper.year;
    topper.exam_name = exam_name || topper.exam_name;
    topper.category_id = category_id || topper.category_id;
    topper.status = [0, 1].includes(Number(status)) ? Number(status) : topper.status;
    topper.topper_image = newImage || topper.topper_image;
    topper.updated_by = req.user?.user_id || 0;

    await topper.save();

    res.json({ message: "Topper updated successfully", data: topper });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


//  Delete
export const deleteTopper = async (req, res) => {
  try {
    const { id } = req.params;
    const topper = await Topper.findByPk(id);
    if (!topper) return res.status(404).json({ message: "Topper not found" });

    if (topper.topper_image) deleteFile(topper.topper_image);

    await topper.destroy();
    res.json({ message: "Topper deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
