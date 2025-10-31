import { Op } from "sequelize";
import RankHolder from "../models/rankHolders.model.js";
import Course from "../models/course.model.js";
import CourseCategory from "../models/courseCategory.model.js";
import { deleteFile } from "../utils/fileHelper.js";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

// create
export const createRankHolder = async (req, res) => {
  try {
    const {
      student_name,
      student_rank,
      based_type,
      course_id,
      category_id,
      exam_name,
      joining_date,
      name_of_office,
      place,
      phone_no,
      approval_status,
      status,
      year,
    } = req.body;

    const student_photo = req.file
      ? `${SERVER_URL}/uploads/rank_holders/${req.file.filename}`
      : null;
    console.log("photo", student_photo);

    const topper_image = req.file ? `${SERVER_URL}/uploads/toppers/${req.file.filename}` : null;

    if (!student_name || !student_rank || !based_type)
      return res.status(400).json({ message: "Missing required fields" });

    if (![1, 2].includes(Number(based_type)))
      return res.status(400).json({ message: "Invalid based_type value" });

    if (based_type == 1) {
      if (!course_id) return res.status(400).json({ message: "Course ID required for based_type=1" });
      const courseExists = await Course.findByPk(course_id);
      if (!courseExists) return res.status(400).json({ message: "Invalid course_id" });
    }

    if (based_type == 2) {
      if (!category_id) return res.status(400).json({ message: "Category ID required for based_type=2" });
      const categoryExists = await CourseCategory.findByPk(category_id);
      if (!categoryExists) return res.status(400).json({ message: "Invalid category_id" });
    }

    if (approval_status && ![1, 2, 3].includes(Number(approval_status)))
      return res.status(400).json({ message: "Invalid approval_status (allowed 1, 2, 3)" });

    const rankHolder = await RankHolder.create({
      student_name,
      student_rank,
      based_type,
      course_id,
      category_id,
      exam_name,
      joining_date,
      name_of_office,
      place,
      phone_no,
      approval_status: approval_status ? Number(approval_status) : 1,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      year,
      student_photo,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({ message: "Rank Holder created successfully", data: rankHolder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// list all
export const getRankHolders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      based_type,
      course_id,
      category_id,
      year,
      approval_status, // ✅ new filter param
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // 🔹 Search filter
    if (search) {
      where.student_name = { [Op.like]: `%${search}%` };
    }

    // 🔹 Status filter (0 or 1)
    if (status && [0, 1].includes(Number(status))) {
      where.status = Number(status);
    }

    // 🔹 Based type filter (1 or 2)
    if (based_type && [1, 2].includes(Number(based_type))) {
      where.based_type = Number(based_type);
    }

    // 🔹 Course, Category, and Year filters
    if (course_id) where.course_id = course_id;
    if (category_id) where.category_id = category_id;
    if (year) where.year = year;

    // 🔹 Approval status filter (only supports 1, 2, 3)
    if (approval_status && [1, 2, 3].includes(Number(approval_status))) {
      where.approval_status = Number(approval_status);
    }

    // 🔹 Query with associations
    const { rows, count } = await RankHolder.findAndCountAll({
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
      order: [["rank_holder_id", "DESC"]],
    });

    // 🔹 Response
    res.json({
      message: "Rank Holders fetched successfully",
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    console.error("Error in getRankHolders:", err);
    res.status(500).json({ error: err.message });
  }
};

// get single
export const getRankHolderById = async (req, res) => {
  try {
    const { id } = req.params;
    const rankHolder = await RankHolder.findByPk(id, {
      include: [
        { model: Course, as: "course", attributes: ["course_id", "course_name"] },
        { model: CourseCategory, as: "category", attributes: ["category_id", "category_name"] },
      ],
    });
    if (!rankHolder) return res.status(404).json({ message: "Rank Holder not found" });
    res.json({ message: "Rank Holder fetched successfully", data: rankHolder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update
export const updateRankHolder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      student_name,
      student_rank,
      based_type,
      course_id,
      category_id,
      exam_name,
      joining_date,
      name_of_office,
      place,
      phone_no,
      approval_status,
      status,
      year,
    } = req.body;

    const newPhoto = req.file
      ? `${SERVER_URL}/uploads/rank_holders/${req.file.filename}`
      : null;

    const rankHolder = await RankHolder.findByPk(id);
    if (!rankHolder) return res.status(404).json({ message: "Rank Holder not found" });

    if (based_type && ![1, 2].includes(Number(based_type)))
      return res.status(400).json({ message: "Invalid based_type value" });

    if (based_type == 1 && course_id) {
      const courseExists = await Course.findByPk(course_id);
      if (!courseExists) return res.status(400).json({ message: "Invalid course_id" });
    }

    if (based_type == 2 && category_id) {
      const categoryExists = await CourseCategory.findByPk(category_id);
      if (!categoryExists) return res.status(400).json({ message: "Invalid category_id" });
    }

    if (approval_status && ![1, 2, 3].includes(Number(approval_status)))
      return res.status(400).json({ message: "Invalid approval_status (allowed 1, 2, 3)" });

    if (newPhoto && rankHolder.student_photo) deleteFile(rankHolder.student_photo);

    rankHolder.student_name = student_name || rankHolder.student_name;
    rankHolder.student_rank = student_rank || rankHolder.student_rank;
    rankHolder.based_type = based_type || rankHolder.based_type;
    rankHolder.course_id = course_id || rankHolder.course_id;
    rankHolder.category_id = category_id || rankHolder.category_id;
    rankHolder.exam_name = exam_name || rankHolder.exam_name;
    rankHolder.joining_date = joining_date || rankHolder.joining_date;
    rankHolder.name_of_office = name_of_office || rankHolder.name_of_office;
    rankHolder.place = place || rankHolder.place;
    rankHolder.phone_no = phone_no || rankHolder.phone_no;
    rankHolder.approval_status = approval_status || rankHolder.approval_status;
    rankHolder.status = [0, 1].includes(Number(status)) ? Number(status) : rankHolder.status;
    rankHolder.year = year || rankHolder.year;
    rankHolder.student_photo = newPhoto || rankHolder.student_photo;
    rankHolder.updated_by = req.user?.user_id || 0;
    rankHolder.updated_at = new Date();

    await rankHolder.save();
    res.json({ message: "Rank Holder updated successfully", data: rankHolder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// delete
export const deleteRankHolder = async (req, res) => {
  try {
    const { id } = req.params;
    const rankHolder = await RankHolder.findByPk(id);
    if (!rankHolder) return res.status(404).json({ message: "Rank Holder not found" });

    if (rankHolder.student_photo) deleteFile(rankHolder.student_photo);

    await rankHolder.destroy();
    res.json({ message: "Rank Holder deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
