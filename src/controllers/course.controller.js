import { Op } from "sequelize";
import { deleteFile } from "../utils/fileHelper.js";
import Result from "../models/result.model.js";
import Course from "../models/course.model.js";
import CourseCategory from "../models/courseCategory.model.js";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

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

    if (!result_title || !result_date || !result_type || !based_type)
      return res.status(400).json({ message: "Required fields are missing" });

    if (![1, 2].includes(Number(result_type)))
      return res.status(400).json({ message: "Invalid result_type (must be 1 or 2)" });

    if (![1, 2].includes(Number(based_type)))
      return res.status(400).json({ message: "Invalid based_type (must be 1 or 2)" });

    if (based_type == 1) {
      if (!course_id) return res.status(400).json({ message: "Course ID required" });
      const course = await Course.findByPk(course_id);
      if (!course) return res.status(400).json({ message: "Invalid Course ID" });
    } else {
      if (!category_id) return res.status(400).json({ message: "Category ID required" });
      const category = await CourseCategory.findByPk(category_id);
      if (!category) return res.status(400).json({ message: "Invalid Category ID" });
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

// list
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

    if (search) where.result_title = { [Op.like]: `%${search}%` };
    if (status && [0, 1].includes(Number(status))) where.status = Number(status);
    if (category_id) where.category_id = category_id;
    if (based_type && [1, 2].includes(Number(based_type))) where.based_type = Number(based_type);
    if (result_type && [1, 2].includes(Number(result_type))) where.result_type = Number(result_type);

    const { rows, count } = await Result.findAndCountAll({
      where,
      include: [
        { model: Course, as: "course", attributes: ["course_id", "course_name"] },
        { model: CourseCategory, as: "category", attributes: ["category_id", "category_name"] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["result_id", "DESC"]],
    });

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

// single
export const getResultById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Result.findByPk(id, {
      include: [
        { model: Course, as: "course", attributes: ["course_id", "course_name"] },
        { model: CourseCategory, as: "category", attributes: ["category_id", "category_name"] },
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

    if (based_type == 1 && course_id) {
      const course = await Course.findByPk(course_id);
      if (!course) return res.status(400).json({ message: "Invalid Course ID" });
    } else if (based_type == 2 && category_id) {
      const category = await CourseCategory.findByPk(category_id);
      if (!category)
        return res.status(400).json({ message: "Invalid Category ID" });
    }

    if (req.file) deleteFile(result.result_file);

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
    result.result_file = req.file
      ? `${SERVER_URL}/uploads/results/${req.file.filename}`
      : result.result_file;
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

    if (result.result_file) deleteFile(result.result_file);

    await result.destroy();
    res.json({ message: "Result deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
