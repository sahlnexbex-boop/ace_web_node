import { Op } from "sequelize";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import CourseCategory from "../models/courseCategory.model.js";
import CourseType from "../models/courseType.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

//  Create
export const createCategory = async (req, res) => {
  try {
    const { category_name, category_description, course_type_id, status } =
      req.body;
    const image = req.file
      ? `${SERVER_URL}/uploads/course_category/${req.file.filename}`
      : null;

    if (!category_name || !course_type_id) {
      return res
        .status(400)
        .json({ message: "Category name and course type are required" });
    }

    const exists = await CourseCategory.findOne({ where: { category_name } });
    if (exists)
      return res.status(400).json({ message: "Category already exists" });

    const courseTypeExists = await CourseType.findByPk(course_type_id);
    if (!courseTypeExists)
      return res.status(400).json({ message: "Invalid course type ID" });

    const category = await CourseCategory.create({
      category_name,
      category_description,
      course_type_id,
      total_courses: 0,
      category_image: image,
      status: [0, 1].includes(Number(status)) ? status : 1,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({
      message: "Category created successfully",
      data: category,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get list
export const getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", type_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where.category_name = { [Op.like]: `%${search}%` };
    }

    if (type_id) {
      where.course_type_id = type_id;
    }

    const { rows, count } = await CourseCategory.findAndCountAll({
      where,
      include: [
        {
          model: CourseType,
          as: "courseType",
          attributes: ["type_id", "type_name"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["category_id", "DESC"]],
    });

    res.json({
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    console.error("Error in getCategories:", err);
    res.status(500).json({ error: err.message });
  }
};

// get single
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await CourseCategory.findByPk(id, {
      include: [
        { model: CourseType, as: "courseType", attributes: ["type_id", "type_name"] },
      ],
    });

    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.json({
      message: "Category found successfully",
      data: category,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, category_description, course_type_id, status } = req.body;

    const category = await CourseCategory.findByPk(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const duplicate = await CourseCategory.findOne({
      where: {
        [Op.and]: [{ category_id: { [Op.ne]: id } }, { category_name }],
      },
    });
    if (duplicate)
      return res.status(400).json({ message: "Category name already exists" });

    if (course_type_id) {
      const typeExists = await CourseType.findByPk(course_type_id);
      if (!typeExists)
        return res.status(400).json({ message: "Invalid course type ID" });
    }

    if (req.file) {
      if (category.category_image) {
        const oldImagePath = category.category_image
          .replace(SERVER_URL, "")
          .replace(/^\//, ""); 

        const fullPath = path.join(process.cwd(), oldImagePath);

        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(" Old image deleted:", fullPath);
        } else {
          console.log(" Old image not found:", fullPath);
        }
      }

      category.category_image = `${SERVER_URL}/uploads/course_category/${req.file.filename}`;
    }

    category.category_name = category_name || category.category_name;
    category.category_description = category_description || category.category_description;
    category.course_type_id = course_type_id || category.course_type_id;
    category.status = [0, 1].includes(Number(status))
      ? Number(status)
      : category.status;
    category.updated_by = req.user?.user_id || 0;
    category.updated_at = new Date();

    await category.save();

    res.json({
      message: "Category updated successfully",
      data: category,
    });
  } catch (err) {
    console.error(" Update error:", err);
    res.status(500).json({ error: err.message });
  }
};

// delete
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await CourseCategory.findByPk(id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    if (category.category_image) {
      const oldImagePath = category.category_image
        .replace(SERVER_URL, "") 
        .replace(/^\//, ""); 

      const fullPath = path.join(process.cwd(), oldImagePath);

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(" Deleted category image:", fullPath);
      } else {
        console.log(" Image file not found:", fullPath);
      }
    }

    await category.destroy();

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error(" Delete error:", err);
    res.status(500).json({ error: err.message });
  }
};
