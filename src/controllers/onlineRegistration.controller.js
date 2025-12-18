import OnlineRegistration from "../models/onlineRegistration.model.js";
import CourseCategory from "../models/courseCategory.model.js";
import Course from "../models/course.model.js";
import { Op } from "sequelize";
import { deleteFile } from "../utils/fileHelper.js";

const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
const phoneRegex = /^[0-9]{10}$/;

// CREATE
export const createRegistration = async (req, res) => {
  try {
    const data = req.body;

    if (!emailRegex.test(data.email))
      return res.status(400).json({ message: "Only @gmail.com allowed" });

    if (!phoneRegex.test(data.phone_number))
      return res.status(400).json({ message: "Invalid phone number" });

    if (data.second_phone_no && !phoneRegex.test(data.second_phone_no))
      return res.status(400).json({ message: "Invalid second phone number" });

    const dept = await CourseCategory.findByPk(data.department_id);
    if (!dept)
      return res.status(400).json({ message: "Invalid department_id" });

    const course = await Course.findByPk(data.course_id);
    if (!course) return res.status(400).json({ message: "Invalid course_id" });

    const student_photo = req.file
      ? `/uploads/registrations/${req.file.filename}`
      : null;

    const registration = await OnlineRegistration.create({
      ...data,
      qualification: data.qualification ? JSON.parse(data.qualification) : null,
      student_photo,
    });

    res.status(201).json({
      message: "Registration submitted successfully",
      data: registration,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LIST
export const getRegistrations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      department_id,
      course_id,
      apply_status,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    /* ---------------- BUILD WHERE CONDITION ---------------- */

    const where = {};

    // 🔍 Search by student name
    if (search) {
      where.student_name = { [Op.like]: `%${search}%` };
    }

    // 🏫 Filter by department
    if (department_id) {
      where.department_id = Number(department_id);
    }

    // 📘 Filter by course
    if (course_id) {
      where.course_id = Number(course_id);
    }

    // 📌 Filter by application status
    if (apply_status) {
      where.apply_status = apply_status;
    }

    /* ---------------- QUERY ---------------- */

    const { rows, count } = await OnlineRegistration.findAndCountAll({
      where,
      include: [
        {
          model: CourseCategory,
          as: "department",
          attributes: ["category_id", "category_name"],
        },
        {
          model: Course,
          as: "course",
          attributes: ["course_id", "course_name"],
        },
      ],
      limit: Number(limit),
      offset,
      order: [["registration_id", "DESC"]],
    });

    /* ---------------- RESPONSE ---------------- */

    res.json({
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / Number(limit)),
      data: rows,
    });
  } catch (err) {
    console.error("getRegistrations error:", err);
    res.status(500).json({ error: err.message });
  }
};

// SINGLE
export const getRegistrationById = async (req, res) => {
  const reg = await OnlineRegistration.findByPk(req.params.id, {
    include: [
      {
        model: CourseCategory,
        as: "department",
        attributes: ["category_id", "category_name"],
      },
      {
        model: Course,
        as: "course",
        attributes: ["course_id", "course_name"],
      },
    ],
  });

  if (!reg) return res.status(404).json({ message: "Not found" });
  res.json(reg);
};

// UPDATE
export const updateRegistration = async (req, res) => {
  const reg = await OnlineRegistration.findByPk(req.params.id);
  if (!reg) return res.status(404).json({ message: "Not found" });

  if (req.file && reg.student_photo) deleteFile(reg.student_photo);

  Object.assign(reg, req.body);
  reg.qualification = req.body.qualification
    ? JSON.parse(req.body.qualification)
    : reg.qualification;

  if (req.file)
    reg.student_photo = `/uploads/registrations/${req.file.filename}`;

  await reg.save();
  res.json({ message: "Updated successfully", data: reg });
};

// DELETE
export const deleteRegistration = async (req, res) => {
  const reg = await OnlineRegistration.findByPk(req.params.id);
  if (!reg) return res.status(404).json({ message: "Not found" });

  if (reg.student_photo) deleteFile(reg.student_photo);
  await reg.destroy();

  res.json({ message: "Deleted successfully" });
};
