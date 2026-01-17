import Enquiry from "../models/enquiry.model.js";
import Course from "../models/course.model.js";
import { Op } from "sequelize";
import ExcelJS from "exceljs";

// create
export const createEnquiry = async (req, res) => {
  try {
    let {
      cstmr_name,
      cstmr_email,
      cstmr_phone,
      cstmr_message,
      enquiry_type,
      course_id,
      enquiry_status,
      status,
      created_by = 0,
    } = req.body;

    if (!cstmr_name || !cstmr_phone || !cstmr_message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (![1, 2, 3, 4].includes(Number(enquiry_type))) {
      return res.status(400).json({ message: "Invalid enquiry_type (1-4 only)" });
    }

    // If enquiry_type is 2 (Course), course_id is required
    if (Number(enquiry_type) === 2) {
      if (!course_id) {
        return res.status(400).json({ message: "course_id is required when enquiry_type is 2 (Course)" });
      }
    }

    // Validate course_id if provided
    let validatedCourseId = null;
    if (course_id) {
      const course = await Course.findByPk(course_id);
      if (!course) {
        return res.status(400).json({ message: "Invalid course_id. Course not found." });
      }
      validatedCourseId = course_id;
    }

    enquiry_status = Number(enquiry_status) || 1;

    if (![1, 2, 3].includes(enquiry_status)) {
      return res.status(400).json({ message: "Invalid enquiry_status (1-3 only)" });
    }

    const newEnquiry = await Enquiry.create({
      cstmr_name,
      cstmr_email,
      cstmr_phone,
      cstmr_message,
      enquiry_type: Number(enquiry_type),
      course_id: validatedCourseId,
      enquiry_status,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by,
    });

    res.json({
      message: "Enquiry created successfully",
      data: newEnquiry,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// list
export const getEnquiries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      enquiry_type,
      enquiry_status,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { cstmr_name: { [Op.like]: `%${search}%` } },
        { cstmr_email: { [Op.like]: `%${search}%` } },
        { cstmr_phone: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status && [0, 1].includes(Number(status))) where.status = Number(status);
    if (enquiry_type && [1, 2, 3, 4].includes(Number(enquiry_type)))
      where.enquiry_type = Number(enquiry_type);
    if (enquiry_status && [1, 2, 3].includes(Number(enquiry_status)))
      where.enquiry_status = Number(enquiry_status);

    const { rows, count } = await Enquiry.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["enquiry_id", "DESC"]],
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["course_name"],
          required: false,
        },
      ],
    });

    // Map results to include course_name
    const data = rows.map((enquiry) => {
      const enquiryData = enquiry.toJSON();
      const { course, ...rest } = enquiryData;
      return {
        ...rest,
        course_name: course?.course_name || null,
      };
    });

    res.json({
      message: "Enquiries fetched successfully",
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Single 
export const getSingleEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.findByPk(id, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["course_name"],
          required: false,
        },
      ],
    });
    if (!enquiry)
      return res.status(404).json({ message: "Enquiry not found" });
    
    const enquiryData = enquiry.toJSON();
    const { course, ...rest } = enquiryData;
    const data = {
      ...rest,
      course_name: course?.course_name || null,
    };
    
    res.json({ message: "Enquiry fetched successfully", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Enquiry
export const updateEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      cstmr_name,
      cstmr_email,
      cstmr_phone,
      cstmr_message,
      enquiry_type,
      course_id,
      enquiry_status,
      status,
      updated_by = 0,
    } = req.body;

    const enquiry = await Enquiry.findByPk(id);
    if (!enquiry)
      return res.status(404).json({ message: "Enquiry not found" });

    if (enquiry_type && ![1, 2, 3, 4].includes(Number(enquiry_type)))
      return res.status(400).json({ message: "Invalid enquiry_type (1–4 only)" });

    // Determine the final enquiry_type value (use new value or existing)
    const finalEnquiryType = enquiry_type ? Number(enquiry_type) : enquiry.enquiry_type;

    // Validate course_id if provided, otherwise set to null
    let validatedCourseId = null; // Default to null if not provided
    if (course_id !== undefined) {
      if (course_id === null || course_id === "") {
        validatedCourseId = null;
      } else {
        const course = await Course.findByPk(course_id);
        if (!course) {
          return res.status(400).json({ message: "Invalid course_id. Course not found." });
        }
        validatedCourseId = course_id;
      }
    }

    // If enquiry_type is 2 (Course), course_id is required
    if (finalEnquiryType === 2) {
      if (!validatedCourseId) {
        return res.status(400).json({ message: "course_id is required when enquiry_type is 2 (Course)" });
      }
    }

    if (enquiry_status && ![1, 2, 3].includes(Number(enquiry_status)))
      return res.status(400).json({ message: "Invalid enquiry_status (1–3 only)" });

    await enquiry.update({
      cstmr_name: cstmr_name ?? enquiry.cstmr_name,
      cstmr_email: cstmr_email ?? enquiry.cstmr_email,
      cstmr_phone: cstmr_phone ?? enquiry.cstmr_phone,
      cstmr_message: cstmr_message ?? enquiry.cstmr_message,
      enquiry_type: finalEnquiryType,
      course_id: validatedCourseId,
      enquiry_status: enquiry_status ?? enquiry.enquiry_status,
      status:
        [0, 1].includes(Number(status)) ? Number(status) : enquiry.status,
      updated_by,
    });

    res.json({ message: "Enquiry updated successfully", data: enquiry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Delete 
export const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.findByPk(id);
    if (!enquiry)
      return res.status(404).json({ message: "Enquiry not found" });

    await enquiry.destroy();
    res.json({ message: "Enquiry deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Excel Download
export const downloadEnquiryExcel = async (req, res) => {
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
          model: Course,
          as: "course",
          attributes: ["course_name"],
          required: false,
        },
      ],
      order: [["enquiry_id", "DESC"]],
    };

    // FULL EXPORT
    if (exportType === "all") {
      rows = await Enquiry.findAll(queryOptions);
    }
    // PAGINATED EXPORT
    else {
      const offset = (Number(page) - 1) * Number(limit);

      rows = await Enquiry.findAll({
        ...queryOptions,
        limit: Number(limit),
        offset,
      });
    }

    // CREATE EXCEL
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Enquiries");

    worksheet.columns = [
      { header: "SI.No", key: "si_no", width: 8 },
      { header: "Customer Name", key: "cstmr_name", width: 25 },
      { header: "Email", key: "cstmr_email", width: 28 },
      { header: "Phone No", key: "cstmr_phone", width: 18 },
      { header: "Message", key: "cstmr_message", width: 40 },
      { header: "Enquiry Type", key: "enquiry_type", width: 18 },
      { header: "Course Name", key: "course_name", width: 30 },
      { header: "Submit Date", key: "submit_date", width: 18 },
      { header: "Enquiry Status", key: "enquiry_status", width: 18 },
      { header: "Status", key: "status", width: 12 },
    ];

    // Header styling
    worksheet.getRow(1).font = { bold: true };

    // Status mappers
    const enquiryTypeMap = {
      1: "General",
      2: "Course",
      3: "Event",
      4: "Other",
    };

    const enquiryStatusMap = {
      1: "Pending",
      2: "In Progress",
      3: "Closed",
    };

    const statusMap = {
      0: "Inactive",
      1: "Active",
    };

    rows.forEach((item, index) => {
      const enquiryData = item.toJSON();
      const { course, ...rest } = enquiryData;
      
      worksheet.addRow({
        si_no: index + 1,
        cstmr_name: rest.cstmr_name || "",
        cstmr_email: rest.cstmr_email || "",
        cstmr_phone: rest.cstmr_phone || "",
        cstmr_message: rest.cstmr_message || "",
        enquiry_type: enquiryTypeMap[rest.enquiry_type] || "General",
        course_name: course?.course_name || "",
        submit_date: rest.submit_date
          ? new Date(rest.submit_date).toLocaleDateString("en-GB")
          : "",
        enquiry_status: enquiryStatusMap[rest.enquiry_status] || "Pending",
        status: statusMap[rest.status] || "Active",
      });
    });

    // RESPONSE HEADERS
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=enquiries_${
        exportType === "all" ? "full" : `page_${page}`
      }.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Enquiry Excel export error:", error);
    res.status(500).json({
      message: "Failed to export enquiry data",
    });
  }
};
