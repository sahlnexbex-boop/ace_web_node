import { Op } from "sequelize";
import sequelize from "../config/db.js";
import { deleteFile } from "../utils/fileHelper.js";

import CourseCategory from "../models/courseCategory.model.js";
import CourseType from "../models/courseType.model.js";
import Course from "../models/course.model.js";
import { deslugify, slugify } from "../utils/slugify.js";

// helper
const isUnsupportedFile = (mimetype) => {
  return !mimetype.startsWith("image/");
};

// create
export const createCategory = async (req, res) => {
  try {
    const { category_name, category_description, course_type_id, status } =
      req.body;

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

    const image = req.file
      ? `/uploads/course_category/${req.file.filename}`
      : null;

    if (isUnsupportedFile(req.file.mimetype)) {
      return res
        .status(400)
        .json({ message: "Invalid file type. Only images are allowed." });
    }

    const category = await CourseCategory.create({
      category_name,
      category_description,
      course_type_id,
      total_courses: 0,
      category_image: image,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
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

// list
export const getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", type_id, status, course_type } =
      req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where.category_name = { [Op.like]: `%${search}%` };
    }

    if (type_id) {
      where.course_type_id = type_id;
    }

    if (status !== undefined && (status === "0" || status === "1")) {
      where.status = Number(status);
    }

    // Filter categories that have at least one course with matching course_type (1 or 2)
    if (course_type !== undefined && course_type !== "") {
      const courseTypeVal = Number(course_type);
      if (![1, 2].includes(courseTypeVal)) {
        return res.status(400).json({
          message: "course_type must be 1 or 2",
        });
      }
      const jsonVal = courseTypeVal === 1 ? sequelize.literal("'1'") : sequelize.literal("'2'");
      const matchingCourses = await Course.findAll({
        attributes: ["course_category_id"],
        where: {
          status: 1,
          [Op.and]: [
            sequelize.where(
              sequelize.fn(
                "JSON_CONTAINS",
                sequelize.col("course_type"),
                jsonVal,
                sequelize.literal("'$'")
              ),
              1
            ),
          ],
        },
        raw: true,
      });
      const categoryIds = [...new Set(matchingCourses.map((c) => c.course_category_id).filter(Boolean))];
      if (categoryIds.length === 0) {
        return res.json({
          total: 0,
          page: Number(page),
          totalPages: 0,
          data: [],
        });
      }
      where.category_id = { [Op.in]: categoryIds };
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

// single get by id
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await CourseCategory.findByPk(id, {
      include: [
        {
          model: CourseType,
          as: "courseType",
          attributes: ["type_id", "type_name"],
        },
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

// get single category by slug (category_name)
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ message: "Slug is required" });
    }
    const categories = await CourseCategory.findAll({
      where: { status: 1 },
      include: [
        {
          model: CourseType,
          as: "courseType",
          attributes: ["type_id", "type_name"],
        },
      ],
    });
    const category = categories.find(
      (cat) => slugify(cat.category_name) === slug
    );
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category fetched successfully", data: category });
  } catch (err) {
    console.error("getCategoryBySlug error:", err);
    res.status(500).json({ error: err.message });
  }
};

// update
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, category_description, course_type_id, status } =
      req.body;

    const newImage = req.file
      ? `/uploads/course_category/${req.file.filename}`
      : null;

    const category = await CourseCategory.findByPk(id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    // ----- Duplicate Name Check -----
    const duplicate = await CourseCategory.findOne({
      where: {
        [Op.and]: [{ category_id: { [Op.ne]: id } }, { category_name }],
      },
    });
    if (duplicate)
      return res.status(400).json({ message: "Category name already exists" });

    // ----- Validate Course Type -----
    if (course_type_id) {
      const typeExists = await CourseType.findByPk(course_type_id);
      if (!typeExists)
        return res.status(400).json({ message: "Invalid course type ID" });
    }

    // ----- Validate File Type BEFORE deleting old -----
    if (newImage && isUnsupportedFile(req.file.mimetype)) {
      return res
        .status(400)
        .json({ message: "Invalid file type. Only images are allowed." });
    }

    // ----- Delete Old Image -----
    if (newImage && category.category_image) {
      deleteFile(category.category_image);
    }

    // ----- Update Fields -----
    category.category_name = category_name || category.category_name;
    category.category_description =
      category_description || category.category_description;
    category.course_type_id = course_type_id || category.course_type_id;

    category.status = [0, 1].includes(Number(status))
      ? Number(status)
      : category.status;

    category.category_image = newImage || category.category_image;

    category.updated_by = req.user?.user_id || 0;
    category.updated_at = new Date();

    await category.save();

    res.json({
      message: "Category updated successfully",
      data: category,
    });
  } catch (err) {
    console.error("Update error:", err);
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

    // Delete image file
    deleteFile(category.category_image);

    await category.destroy();

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: err.message });
  }
};
