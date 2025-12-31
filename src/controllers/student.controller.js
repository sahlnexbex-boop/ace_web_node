import Student from "../models/student.model.js";
import { Op } from "sequelize";
import { deleteFile } from "../utils/fileHelper.js";

const isUnsupportedFile = (mimetype) => {
  return !mimetype.startsWith("image/");
};

const normalizeStatus = (value, defaultValue = 1) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const num = Number(value);
  return num === 0 || num === 1 ? num : defaultValue;
};

//   CREATE STUDENT 
export const createStudent = async (req, res) => {
  try {
    const {
      std_name,
      std_email,
      std_phone,
      password,
      admission_no,
      registre_no,
      is_ace_std,
      status,
    } = req.body;

    if (!std_name || !std_email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await Student.findOne({
      where: {
        [Op.or]: [
          { std_email },
          admission_no ? { admission_no } : null,
          registre_no ? { registre_no } : null,
        ].filter(Boolean),
      },
    });

    if (exists) {
      return res
        .status(400)
        .json({ message: "Email / Admission No / Register No already exists" });
    }

    if (req.file && isUnsupportedFile(req.file.mimetype)) {
      return res
        .status(400)
        .json({ message: "Invalid file type. Image only allowed" });
    }

    const std_photo = req.file
      ? `/uploads/students/${req.file.filename}`
      : null;

    const student = await Student.create({
      std_name,
      std_email,
      std_phone,
      password,
      admission_no,
      registre_no,
      is_ace_std: !!is_ace_std,
      std_photo,
      status: normalizeStatus(status, 1),
      created_by: req.user?.user_id || 0,
    });

    const { password: _, ...data } = student.toJSON();

    res.status(201).json({
      message: "Student created successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//   LIST STUDENTS 
export const listStudents = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10, status } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { std_name: { [Op.like]: `%${search}%` } },
        { std_email: { [Op.like]: `%${search}%` } },
        { admission_no: { [Op.like]: `%${search}%` } },
        { registre_no: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status !== undefined) {
      where.status = normalizeStatus(status, undefined); 
    }

    const { rows, count } = await Student.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      attributes: { exclude: ["password"] },
      order: [["std_id", "DESC"]],
    });

    res.json({
      total: count,
      page: Number(page),
      pages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//   GET STUDENT 
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });

    if (!student)
      return res.status(404).json({ message: "Student not found" });

    res.json({
      message: "Student fetched successfully",
      data: student,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//   UPDATE STUDENT 
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id);
    if (!student)
      return res.status(404).json({ message: "Student not found" });

    const {
      std_name,
      std_email,
      std_phone,
      password,
      admission_no,
      registre_no,
      is_ace_std,
      status,
    } = req.body;

    const duplicate = await Student.findOne({
      where: {
        std_id: { [Op.ne]: id },
        [Op.or]: [
          { std_email },
          admission_no ? { admission_no } : null,
          registre_no ? { registre_no } : null,
        ].filter(Boolean),
      },
    });

    if (duplicate) {
      return res
        .status(400)
        .json({ message: "Email / Admission No / Register No already used" });
    }

    if (req.file && isUnsupportedFile(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid image file" });
    }

    const newPhoto = req.file
      ? `/uploads/students/${req.file.filename}`
      : null;

    if (newPhoto && student.std_photo) {
      deleteFile(student.std_photo);
    }

    student.std_name = std_name ?? student.std_name;
    student.std_email = std_email ?? student.std_email;
    student.std_phone = std_phone ?? student.std_phone;
    student.admission_no = admission_no ?? student.admission_no;
    student.registre_no = registre_no ?? student.registre_no;
    student.is_ace_std =
      typeof is_ace_std === "boolean" ? is_ace_std : student.is_ace_std;
     if (status !== undefined) {
      student.status = normalizeStatus(status, student.status); 
    }
    student.std_photo = newPhoto || student.std_photo;

    if (password) student.password = password;

    student.updated_by = req.user?.user_id || 0;

    await student.save();

    const { password: _, ...data } = student.toJSON();

    res.json({
      message: "Student updated successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//   DELETE STUDENT 
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student)
      return res.status(404).json({ message: "Student not found" });

    if (student.std_photo) {
      deleteFile(student.std_photo);
    }

    await student.destroy();

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
