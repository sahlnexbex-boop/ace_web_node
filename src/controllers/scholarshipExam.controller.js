import ScholarshipExam from "../models/scholarshipExam.model.js";
import { Op } from "sequelize";


// CREATE 
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

    const exam = await ScholarshipExam.create({
      exam_title,
      exam_description,
      exam_date,
      exam_time,
      exam_location,
      last_apply_date,
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

// LIST 
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

// GET SINGLE
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

// UPDATE
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

    await exam.update({
      exam_title: exam_title ?? exam.exam_title,
      exam_description: exam_description ?? exam.exam_description,
      exam_date: exam_date ?? exam.exam_date,
      exam_time: exam_time ?? exam.exam_time,
      exam_location: exam_location ?? exam.exam_location,
      last_apply_date: last_apply_date ?? exam.last_apply_date,
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

// DELETE
export const deleteScholarshipExam = async (req, res) => {
  try {
    const exam = await ScholarshipExam.findByPk(req.params.id);

    if (!exam)
      return res.status(404).json({ message: "Scholarship exam not found" });

    await exam.destroy();

    res.json({ message: "Scholarship exam deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
