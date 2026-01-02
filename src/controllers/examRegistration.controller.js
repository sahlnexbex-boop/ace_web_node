import ExamRegistration from "../models/examRegistration.model.js";
import ScholarshipExam from "../models/scholarshipExam.model.js";
import { Op } from "sequelize";
import Student from "../models/student.model.js";

// Generate registration code
const generateRegistrationCode = async (branchCode, examId) => {
  const year = new Date().getFullYear().toString().slice(-2);

  const count = await ExamRegistration.count({
    where: { exam_id: examId },
  });

  const serial = String(count + 1).padStart(4, "0");

  return `ACE${year}-${branchCode}-${serial}`;
};

// CREATE
export const createExamRegistration = async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      date_of_birth,
      branch,
      exam_id,
      std_id,
      address,
      is_ace_std,
      status,
    } = req.body;

    if (
      !name ||
      !mobile ||
      !email ||
      !date_of_birth ||
      !branch ||
      !exam_id ||
      !std_id
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate exam_id
    const exam = await ScholarshipExam.findByPk(exam_id);
    if (!exam) {
      return res.status(400).json({ message: "Invalid exam_id" });
    }

    // validate student
    const student = await Student.findByPk(std_id);
    if (!student) {
      return res.status(400).json({ message: "Invalid student_id" });
    }

    const registration_code = await generateRegistrationCode(
      branch,
      exam_id
    );

    const registration = await ExamRegistration.create({
      name,
      mobile,
      email,
      date_of_birth,
      branch,
      exam_id,
      std_id,
      address,
      registration_code,
      is_ace_std: [0, 1].includes(Number(is_ace_std))
        ? Number(is_ace_std)
        : 0,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({
      message: "Exam registration created successfully",
      data: registration,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LIST
export const getExamRegistrations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } },
        { registration_code: { [Op.like]: `%${search}%` } },
      ];
    }

    if ([0, 1].includes(Number(status))) {
      where.status = Number(status);
    }

    const { rows, count } = await ExamRegistration.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["reg_id", "DESC"]],
      include: [
        {
          model: ScholarshipExam,
          attributes: ["exam_title"],
          required: false,
        },
        {
          model: Student,
          attributes: ["std_name"],
          required: false,
        },
      ],
    });

    res.json({
      message: "Exam registrations fetched successfully",
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
export const getExamRegistrationById = async (req, res) => {
  try {
    const registration = await ExamRegistration.findByPk(req.params.id, {
      include: [
        {
          model: ScholarshipExam,
          attributes: ["exam_title"],
          required: false,
        },
      ],
    });

    if (!registration) {
      return res.status(404).json({ message: "Exam registration not found" });
    }

    res.json({
      message: "Exam registration fetched successfully",
      data: registration,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
export const updateExamRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const registration = await ExamRegistration.findByPk(id);

    if (!registration) {
      return res.status(404).json({ message: "Exam registration not found" });
    }

    const {
      name,
      mobile,
      email,
      date_of_birth,
      branch,
      exam_id,
      std_id,
      address,
      is_ace_std,
      status,
    } = req.body;

    // Validate exam_id if changed
    if (exam_id) {
      const exam = await ScholarshipExam.findByPk(exam_id);
      if (!exam) {
        return res.status(400).json({ message: "Invalid exam_id" });
      }
    }

    // validate student
    if (std_id) {
      const student = await Student.findByPk(std_id);
      if (!student) {
        return res.status(400).json({ message: "Invalid student_id" });
      }
    }

    await registration.update({
      name: name ?? registration.name,
      mobile: mobile ?? registration.mobile,
      email: email ?? registration.email,
      date_of_birth: date_of_birth ?? registration.date_of_birth,
      branch: branch ?? registration.branch,
      exam_id: exam_id ?? registration.exam_id,
      std_id: std_id ?? registration.std_id,
      address: address ?? registration.address,
      is_ace_std: [0, 1].includes(Number(is_ace_std))
        ? Number(is_ace_std)
        : registration.is_ace_std,
      status: [0, 1].includes(Number(status))
        ? Number(status)
        : registration.status,
      updated_by: req.user?.user_id || 0,
    });

    res.json({
      message: "Exam registration updated successfully",
      data: registration,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
export const deleteExamRegistration = async (req, res) => {
  try {
    const registration = await ExamRegistration.findByPk(req.params.id);

    if (!registration) {
      return res.status(404).json({ message: "Exam registration not found" });
    }

    await registration.destroy();

    res.json({ message: "Exam registration deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
