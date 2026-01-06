import ExamRegistration from "../models/examRegistration.model.js";
import ScholarshipExam from "../models/scholarshipExam.model.js";
import { Op } from "sequelize";
import Student from "../models/student.model.js";
import fs from "fs";
import path from "path";
import { PDFDocument, rgb } from "pdf-lib";
import ExcelJS from "exceljs";

//  SAFE FILENAME HELPER 
const makeSafeFileName = (value = "") =>
  value
    .toString()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "");

// Generate registration code
const generateRegistrationCode = async (branchCode, examId) => {
  const year = new Date().getFullYear().toString().slice(-2);

  const count = await ExamRegistration.count({
    where: { exam_id: examId },
  });

  const serial = String(count + 1).padStart(4, "0");

  return `ACE${year}-${branchCode}-${serial}`;
};

// Generate hall ticket
export const generateHallTicket = async (req, res) => {
  try {
    const { id } = req.params;
    
    const registration = await ExamRegistration.findByPk(id, {
      include: [
        {
          model: ScholarshipExam,
          attributes: [
            "exam_title",
            "exam_date",
            "exam_time",
            "exam_location",
          ],
        },
      ],
    });

    if (!registration) {
      return res.status(404).json({
        message: "Hall ticket not found",
      });
    }

    const {
      name,
      mobile,
      email,
      address,
      registration_code,
    } = registration;

    const exam = registration.ScholarshipExam;

    // Load the PDF template
    const templatePath = path.join(
      process.cwd(),
      "src",
      "assets",
      "pdf",
      "hall_ticket_template.pdf"
    );

    const pdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPages()[0];

    const fontSize = 10;
    const color = rgb(0, 0, 0);

    // Fill in the form data
    page.drawText(name || "-", { x: 200, y: 565, size: fontSize, color });
    page.drawText(mobile || "-", { x: 200, y: 540, size: fontSize, color });
    page.drawText(email || "-", { x: 200, y: 520, size: fontSize, color });
    page.drawText(address || "-", { x: 200, y: 500, size: fontSize, color });

    page.drawText(exam?.exam_title || "-", {
      x: 200,
      y: 452,
      size: fontSize,
      color,
    });

    page.drawText(registration_code || "-", {
      x: 200,
      y: 428,
      size: fontSize,
      color,
    });

    page.drawText(
      `${exam?.exam_date || "-"} | ${exam?.exam_time || "-"}`,
      { x: 200, y: 406, size: fontSize, color }
    );

    page.drawText(exam?.exam_location || "-", {
      x: 200,
      y: 385,
      size: fontSize,
      color,
    });

    const finalPdf = await pdfDoc.save();

    const safeStudentName = makeSafeFileName(name);
    const safeExamName = makeSafeFileName(exam?.exam_title || "Exam");

    const fileName = `${safeStudentName}_${safeExamName}_Hall_Ticket.pdf`;

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": finalPdf.length,
    });

    res.send(Buffer.from(finalPdf));
  } catch (err) {
    console.error("Hall ticket error:", err);
    res.status(500).json({ error: err.message });
  }
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
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const exam = await ScholarshipExam.findByPk(exam_id);
    if (!exam) {
      return res.status(400).json({ message: "Invalid exam_id" });
    }

    const student = await Student.findByPk(std_id);
    if (!student) {
      return res.status(400).json({ message: "Invalid student_id" });
    }

    // DUPLICATE CHECK
    const alreadyRegistered = await ExamRegistration.findOne({
      where: {
        exam_id,
        [Op.or]: [{ email }, { std_id }],
      },
    });

    if (alreadyRegistered) {
      return res.status(400).json({
        message:
          "You have already registered for this exam using this email or student ID",
      });
    }

    // GENERATE REGISTRATION CODE
    const registration_code = await generateRegistrationCode(branch, exam_id);

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
      is_ace_std: [0, 1].includes(Number(is_ace_std)) ? Number(is_ace_std) : 0,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({
      message: "Exam registration created successfully",
      data: registration,
    });
  } catch (err) {
    console.error("Exam Registration Error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
};

// LIST
export const getExamRegistrations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status, std_id } = req.query;

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

    if (std_id) {
      where.std_id = Number(std_id);
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

// excel
export const downloadExamRegistrationExcel = async (req, res) => {
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
          model: ScholarshipExam,
          attributes: ["exam_title"],
          required: false,
        },
      ],
      order: [["reg_id", "DESC"]],
    };

    //  FULL EXPORT
    if (exportType === "all") {
      rows = await ExamRegistration.findAll(queryOptions);
    }
    //  PAGINATED EXPORT
    else {
      const offset = (Number(page) - 1) * Number(limit);

      rows = await ExamRegistration.findAll({
        ...queryOptions,
        limit: Number(limit),
        offset,
      });
    }

    // CREATE EXCEL
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Exam Registrations");

    worksheet.columns = [
      { header: "SI.No", key: "si_no", width: 8 },
      { header: "Reg No", key: "registration_code", width: 20 },
      { header: "Name", key: "name", width: 22 },
      { header: "Exam", key: "exam", width: 30 },
      { header: "Branch", key: "branch", width: 15 },
      { header: "Phone No", key: "mobile", width: 18 },
      { header: "Email", key: "email", width: 28 },
      { header: "Date of Birth", key: "dob", width: 15 },
      { header: "Address", key: "address", width: 30 },
      { header: "ACE Student", key: "is_ace_std", width: 15 },
      { header: "Status", key: "status", width: 12 },
    ];

    // Header styling
    worksheet.getRow(1).font = { bold: true };

    // Status mapper
    const statusMap = {
      0: "Inactive",
      1: "Active",
    };

    rows.forEach((item, index) => {
      worksheet.addRow({
        si_no: index + 1,
        registration_code: item.registration_code || "",
        name: item.name || "",
        exam: item.ScholarshipExam?.exam_title || "",
        branch: item.branch || "",
        mobile: item.mobile || "",
        email: item.email || "",
        dob: item.date_of_birth
          ? new Date(item.date_of_birth).toLocaleDateString("en-GB")
          : "",
        address: item.address || "",
        is_ace_std: item.is_ace_std ? "Yes" : "No",
        status: statusMap[item.status] || "Active",
      });
    });

    // RESPONSE HEADERS
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=exam_registrations_${
        exportType === "all" ? "full" : `page_${page}`
      }.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Exam Registration Excel export error:", error);
    res.status(500).json({
      message: "Failed to export exam registration data",
    });
  }
};
