import ScholarshipExam from "../models/scholarshipExam.model.js";
import { Op } from "sequelize";
import { deleteFile } from "../utils/fileHelper.js";

// helpers
const isUnsupportedFile = (mimetype) => {
  return !mimetype.startsWith("image/");
};

// create
export const createScholarshipExam = async (req, res) => {
  try {
    const {
      exam_title,
      exam_description,
      exam_date,
      exam_time,
      exam_location,
      last_apply_date,
      status,
    } = req.body;

    if (
      !exam_title ||
      !exam_description ||
      !exam_date ||
      !exam_time ||
      !exam_location ||
      !last_apply_date
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (req.file && isUnsupportedFile(req.file.mimetype)) {
      return res
        .status(400)
        .json({ message: "Invalid file type. Images only allowed" });
    }

    const exam_image = req.file
      ? `/uploads/scholarship_exams/${req.file.filename}`
      : null;

    const exam = await ScholarshipExam.create({
      exam_title,
      exam_description,
      exam_date,
      exam_time,
      exam_location,
      last_apply_date,
      exam_image,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({
      message: "Scholarship exam created successfully",
      data: exam,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// list
export const getScholarshipExams = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { exam_title: { [Op.like]: `%${search}%` } },
        { exam_location: { [Op.like]: `%${search}%` } },
      ];
    }

    if ([0, 1].includes(Number(status))) {
      where.status = Number(status);
    }

    const { rows, count } = await ScholarshipExam.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["exam_id", "DESC"]],
    });

    res.json({
      message: "Scholarship exams fetched successfully",
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// single get
export const getScholarshipExamById = async (req, res) => {
  try {
    const exam = await ScholarshipExam.findByPk(req.params.id);

    if (!exam)
      return res.status(404).json({ message: "Scholarship exam not found" });

    res.json({
      message: "Scholarship exam fetched successfully",
      data: exam,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update
export const updateScholarshipExam = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await ScholarshipExam.findByPk(id);

    if (!exam)
      return res.status(404).json({ message: "Scholarship exam not found" });

    const {
      exam_title,
      exam_description,
      exam_date,
      exam_time,
      exam_location,
      last_apply_date,
      status,
    } = req.body;

    if (req.file && isUnsupportedFile(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid image file" });
    }

    const newImage = req.file
      ? `/uploads/scholarship_exams/${req.file.filename}`
      : null;

    // delete old image
    if (newImage && exam.exam_image) {
      deleteFile(exam.exam_image);
    }

    await exam.update({
      exam_title: exam_title ?? exam.exam_title,
      exam_description: exam_description ?? exam.exam_description,
      exam_date: exam_date ?? exam.exam_date,
      exam_time: exam_time ?? exam.exam_time,
      exam_location: exam_location ?? exam.exam_location,
      last_apply_date: last_apply_date ?? exam.last_apply_date,
      exam_image: newImage ?? exam.exam_image,
      status: [0, 1].includes(Number(status)) ? Number(status) : exam.status,
      updated_by: req.user?.user_id || 0,
    });

    res.json({
      message: "Scholarship exam updated successfully",
      data: exam,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// delete
export const deleteScholarshipExam = async (req, res) => {
  try {
    const exam = await ScholarshipExam.findByPk(req.params.id);

    if (!exam)
      return res.status(404).json({ message: "Scholarship exam not found" });

    if (exam.exam_image) deleteFile(exam.exam_image);

    await exam.destroy();

    res.json({ message: "Scholarship exam deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
