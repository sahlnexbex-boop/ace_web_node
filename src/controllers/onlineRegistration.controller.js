import OnlineRegistration from "../models/onlineRegistration.model.js";
import CourseCategory from "../models/courseCategory.model.js";
import Course from "../models/course.model.js";
import { Op } from "sequelize";
import { deleteFile } from "../utils/fileHelper.js";
import ExcelJS from "exceljs";

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

// excel
export const downloadOnlineRegistrationExcel = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      export: exportType, 
    } = req.query;

    let rows;

    const queryOptions = {
      include: [
        {
          model: CourseCategory,
          as: "department",
          attributes: ["category_name"],
        },
        {
          model: Course,
          as: "course",
          attributes: ["course_name"],
        },
      ],
      order: [["registration_id", "DESC"]],
    };

    //  FULL EXPORT
    if (exportType === "all") {
      rows = await OnlineRegistration.findAll(queryOptions);
    } 
    //  PAGINATED EXPORT
    else {
      const offset = (Number(page) - 1) * Number(limit);

      rows = await OnlineRegistration.findAll({
        ...queryOptions,
        limit: Number(limit),
        offset,
      });
    }

    // CREATE EXCEL
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Online Registrations");

    worksheet.columns = [
      { header: "Sl.No", key: "si_no", width: 8 },
      { header: "Student Name", key: "student_name", width: 25 },
      { header: "Branch", key: "branch", width: 18 },
      { header: "Department", key: "department", width: 22 },
      { header: "Course", key: "course", width: 22 },
      { header: "Date of Birth", key: "dob", width: 15 },
      { header: "Email", key: "email", width: 28 },
      { header: "Phone No", key: "phone_no", width: 16 },
      { header: "2nd Phone No", key: "second_phone_no", width: 18 },
      { header: "Apply Status", key: "apply_status", width: 18 },
    ];

    // Header styling
    worksheet.getRow(1).font = { bold: true };

    // Apply status mapper (adjust if needed)
    const applyStatusMap = {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
    };

    rows.forEach((item, index) => {
      worksheet.addRow({
        si_no: index + 1,
        student_name: item.student_name || "",
        branch: item.branch || "",
        department: item.department?.category_name || "",
        course: item.course?.course_name || "",
        dob: item.date_of_birth
          ? new Date(item.date_of_birth).toLocaleDateString("en-GB")
          : "",
        email: item.email || "",
        phone_no: item.phone_number || "",
        second_phone_no: item.second_phone_no || "",
        apply_status:
          applyStatusMap[item.apply_status] || item.apply_status || "Pending",
      });
    });

    // RESPONSE HEADERS
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=online_registrations_${
        exportType === "all" ? "full" : `page_${page}`
      }.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Online Registration Excel export error:", error);
    res.status(500).json({ message: "Failed to export registration data" });
  }
};
