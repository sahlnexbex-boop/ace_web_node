import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Op } from "sequelize";
import Result from "../models/result.model.js";
import Course from "../models/course.model.js";
import CourseCategory from "../models/courseCategory.model.js";

dotenv.config();

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";
const __dirname = path.resolve();

// create
export const createResult = async (req, res) => {
  try {
    const {
      result_title,
      result_description,
      result_date,
      result_type,
      based_type,
      course_id,
      category_id,
      status,
    } = req.body;

    if (!result_title || !result_date || !result_type || !based_type) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    if (![1, 2].includes(Number(result_type)))
      return res.status(400).json({ message: "Invalid result type" });
    if (![1, 2].includes(Number(based_type)))
      return res.status(400).json({ message: "Invalid based type" });

    if (based_type == 1) {
      if (!course_id)
        return res.status(400).json({ message: "Course ID required" });
      const course = await Course.findByPk(course_id);
      if (!course) return res.status(400).json({ message: "Invalid Course ID" });
    } else {
      if (!category_id)
        return res.status(400).json({ message: "Category ID required" });
      const category = await CourseCategory.findByPk(category_id);
      if (!category)
        return res.status(400).json({ message: "Invalid Category ID" });
    }

    const exists = await Result.findOne({ where: { result_title } });
    if (exists)
      return res.status(400).json({ message: "Result title already exists" });

    const file = req.file
      ? `${SERVER_URL}/uploads/results/${req.file.filename}`
      : null;

    const newResult = await Result.create({
      result_title,
      result_description,
      result_date,
      result_type,
      based_type,
      course_id: based_type == 1 ? course_id : null,
      category_id: based_type == 2 ? category_id : null,
      result_file: file,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({
      message: "Result created successfully",
      data: newResult,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get list
export const getResults = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      category_id,
      based_type,
      result_type,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // 🔍 Search filter
    if (search) {
      where.result_title = { [Op.like]: `%${search}%` };
    }

    // ✅ Status filter (only 0 or 1)
    if (status && [0, 1].includes(Number(status))) {
      where.status = Number(status);
    }

    // ✅ Category filter
    if (category_id) {
      where.category_id = category_id;
    }

    // ✅ Based type filter (only 1 or 2 allowed)
    if (based_type && [1, 2].includes(Number(based_type))) {
      where.based_type = Number(based_type);
    }

    // ✅ Result type filter (only 1 or 2 allowed)
    if (result_type && [1, 2].includes(Number(result_type))) {
      where.result_type = Number(result_type);
    }

    // 🔹 Query database
    const { rows, count } = await Result.findAndCountAll({
      where,
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["course_id", "course_name"],
        },
        {
          model: CourseCategory,
          as: "category",
          attributes: ["category_id", "category_name"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["result_id", "DESC"]],
    });

    // ✅ Response
    res.json({
      message: "Results fetched successfully",
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get single
export const getResultById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Result.findByPk(id, {
      include: [
        { model: Course, as: "course", attributes: ["course_id", "course_name"] },
        {
          model: CourseCategory,
          as: "category",
          attributes: ["category_id", "category_name"],
        },
      ],
    });

    if (!result) return res.status(404).json({ message: "Result not found" });

    res.json({
      message: "Result found successfully",
      data: result,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update
export const updateResult = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      result_title,
      result_description,
      result_date,
      result_type,
      based_type,
      course_id,
      category_id,
      status,
    } = req.body;

    const result = await Result.findByPk(id);
    if (!result) return res.status(404).json({ message: "Result not found" });

    const duplicate = await Result.findOne({
      where: {
        [Op.and]: [{ result_id: { [Op.ne]: id } }, { result_title }],
      },
    });
    if (duplicate)
      return res.status(400).json({ message: "Result title already exists" });

    if (based_type == 1) {
      const course = await Course.findByPk(course_id);
      if (!course) return res.status(400).json({ message: "Invalid Course ID" });
    } else if (based_type == 2) {
      const category = await CourseCategory.findByPk(category_id);
      if (!category)
        return res.status(400).json({ message: "Invalid Category ID" });
    }

    let filePath = result.result_file;
    if (req.file) {
      // Remove old file
      if (filePath) {
        const oldFile = path.join(__dirname, filePath.replace(SERVER_URL, ""));
        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
      }
      filePath = `${SERVER_URL}/uploads/results/${req.file.filename}`;
    }

    result.result_title = result_title || result.result_title;
    result.result_description = result_description || result.result_description;
    result.result_date = result_date || result.result_date;
    result.result_type = [1, 2].includes(Number(result_type))
      ? result_type
      : result.result_type;
    result.based_type = [1, 2].includes(Number(based_type))
      ? based_type
      : result.based_type;
    result.course_id = based_type == 1 ? course_id : null;
    result.category_id = based_type == 2 ? category_id : null;
    result.result_file = filePath;
    result.status = [0, 1].includes(Number(status))
      ? Number(status)
      : result.status;
    result.updated_by = req.user?.user_id || 0;
    result.updated_at = new Date();

    await result.save();
    res.json({ message: "Result updated successfully", data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// delete
export const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Result.findByPk(id);
    if (!result) return res.status(404).json({ message: "Result not found" });

    if (result.result_file) {
      const filePath = path.join(__dirname, result.result_file.replace(SERVER_URL, ""));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await result.destroy();
    res.json({ message: "Result deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
