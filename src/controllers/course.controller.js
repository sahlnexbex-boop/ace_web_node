import fs from "fs";
import path from "path";
import { Op } from "sequelize";
import Course from "../models/course.model.js";
import CourseCategory from "../models/courseCategory.model.js";
import { fileURLToPath } from "url";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to delete old files
const deleteFileIfExists = (filePath) => {
  if (!filePath) return;
  const localPath = filePath.replace(SERVER_URL, "").replace(/^\//, "");
  const fullPath = path.join(process.cwd(), localPath);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
};

//  Create Course
export const createCourse = async (req, res) => {
  try {
    const {
      course_name,
      course_description,
      course_rating,
      course_category_id,
      course_duration,
      course_fee,
      course_overview,
      course_syllabus,
      course_study_material,
      status,
    } = req.body;

    if (!course_name || !course_category_id)
      return res.status(400).json({ message: "Course name and category required" });

    const exists = await Course.findOne({ where: { course_name } });
    if (exists) return res.status(400).json({ message: "Course already exists" });

    const category = await CourseCategory.findByPk(course_category_id);
    if (!category) return res.status(400).json({ message: "Invalid category" });

    if (course_rating && Number(course_rating) > 5)
      return res.status(400).json({ message: "Max rating is 5" });

    const image = req.files?.course_image
      ? `${SERVER_URL}/uploads/course/${req.files.course_image[0].filename}`
      : null;

    const syllabusFile = req.files?.course_syllabus_file
      ? `${SERVER_URL}/uploads/course/${req.files.course_syllabus_file[0].filename}`
      : null;

    const questionFile = req.files?.course_questions_file
      ? `${SERVER_URL}/uploads/course/${req.files.course_questions_file[0].filename}`
      : null;

    const newCourse = await Course.create({
      course_name,
      course_description,
      course_rating: course_rating || 0,
      course_category_id,
      course_duration,
      course_fee,
      course_overview,
      course_syllabus,
      course_study_material,
      course_syllabus_file: syllabusFile,
      course_questions_file: questionFile,
      course_image: image,
      status: [0, 1].includes(Number(status)) ? status : 1,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({ message: "Course created successfully", data: newCourse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Get Courses (list)
export const getCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", category_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) where.course_name = { [Op.like]: `%${search}%` };
    if (category_id) where.course_category_id = category_id;

    const { rows, count } = await Course.findAndCountAll({
      where,
      include: [{ model: CourseCategory, as: "category", attributes: ["category_id", "category_name"] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["course_id", "DESC"]],
    });

    res.json({
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Get Single Course
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [{ model: CourseCategory, as: "category", attributes: ["category_id", "category_name"] }],
    });
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({
      message: "Course found successfully",
      data: course,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      course_name,
      course_description,
      course_rating,
      course_category_id,
      course_duration,
      course_fee,
      course_overview,
      course_syllabus,
      course_study_material,
      status,
    } = req.body;

    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const duplicate = await Course.findOne({
      where: { [Op.and]: [{ course_id: { [Op.ne]: id } }, { course_name }] },
    });
    if (duplicate)
      return res.status(400).json({ message: "Course name already exists" });

    if (course_category_id) {
      const exists = await CourseCategory.findByPk(course_category_id);
      if (!exists) return res.status(400).json({ message: "Invalid category" });
    }

    if (req.files?.course_image) deleteFileIfExists(course.course_image);
    if (req.files?.course_syllabus_file) deleteFileIfExists(course.course_syllabus_file);
    if (req.files?.course_questions_file) deleteFileIfExists(course.course_questions_file);

    course.course_name = course_name || course.course_name;
    course.course_description = course_description || course.course_description;
    course.course_rating = course_rating && course_rating <= 5 ? course_rating : course.course_rating;
    course.course_category_id = course_category_id || course.course_category_id;
    course.course_duration = course_duration || course.course_duration;
    course.course_fee = course_fee || course.course_fee;
    course.course_overview = course_overview || course.course_overview;
    course.course_syllabus = course_syllabus || course.course_syllabus;
    course.course_study_material = course_study_material || course.course_study_material;
    course.status = [0, 1].includes(Number(status)) ? status : course.status;
    course.updated_by = req.user?.user_id || 0;
    course.updated_at = new Date();

    if (req.files?.course_image)
      course.course_image = `${SERVER_URL}/uploads/course/${req.files.course_image[0].filename}`;
    if (req.files?.course_syllabus_file)
      course.course_syllabus_file = `${SERVER_URL}/uploads/course/${req.files.course_syllabus_file[0].filename}`;
    if (req.files?.course_questions_file)
      course.course_questions_file = `${SERVER_URL}/uploads/course/${req.files.course_questions_file[0].filename}`;

    await course.save();
    res.json({ message: "Course updated successfully", data: course });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Delete Course
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    deleteFileIfExists(course.course_image);
    deleteFileIfExists(course.course_syllabus_file);
    deleteFileIfExists(course.course_questions_file);

    await course.destroy();
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
