import RankForum from "../models/rankForum.model.js";
import { Op } from "sequelize";
import ExcelJS from "exceljs";

// helpers
const normalizeTinyInt = (val, defaultVal = 1) => {
  if (val === undefined || val === null || val === "") return defaultVal;
  const n = Number(val);
  return n === 0 || n === 1 ? n : defaultVal;
};

const normalizeRequestStatus = (val) => {
  const n = Number(val);
  return [1, 2, 3].includes(n) ? n : 1;
};

//  CREATE 
export const createRankForum = async (req, res) => {
  try {
    const {
      name,
      mobile_no,
      email,
      course,
      batch,
      year_of_study,
      reg_no,
      name_of_office,
      post,
      joining_date,
      office_address,
      request_status,
      status,
    } = req.body;

    // Required fields validation
    if (
      !name ||
      !mobile_no ||
      !email ||
      !course ||
      !year_of_study ||
      !reg_no ||
      !name_of_office ||
      !post ||
      !joining_date
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const forum = await RankForum.create({
      name,
      mobile_no,
      email,
      course,
      batch,
      year_of_study,
      reg_no,
      name_of_office,
      post,
      joining_date,
      office_address,
      request_status: normalizeRequestStatus(request_status),
      status: normalizeTinyInt(status, 1),
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({
      message: "RankForum created successfully",
      data: forum,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  LIST 
export const getRankForums = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      request_status,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { mobile_no: { [Op.like]: `%${search}%` } },
        { reg_no: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status !== undefined) {
      where.status = normalizeTinyInt(status, undefined);
    }

    if ([1, 2, 3].includes(Number(request_status))) {
      where.request_status = Number(request_status);
    }

    const { rows, count } = await RankForum.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      order: [["rankforum_id", "DESC"]],
    });

    res.json({
      message: "RankForums fetched successfully",
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  SINGLE 
export const getRankForumById = async (req, res) => {
  try {
    const forum = await RankForum.findByPk(req.params.id);

    if (!forum) {
      return res.status(404).json({ message: "RankForum not found" });
    }

    res.json({
      message: "RankForum fetched successfully",
      data: forum,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  UPDATE 
export const updateRankForum = async (req, res) => {
  try {
    const forum = await RankForum.findByPk(req.params.id);
    if (!forum) {
      return res.status(404).json({ message: "RankForum not found" });
    }

    const {
      name,
      mobile_no,
      email,
      course,
      batch,
      year_of_study,
      reg_no,
      name_of_office,
      post,
      joining_date,
      office_address,
      request_status,
      status,
    } = req.body;

    Object.assign(forum, {
      name: name ?? forum.name,
      mobile_no: mobile_no ?? forum.mobile_no,
      email: email ?? forum.email,
      course: course ?? forum.course,
      batch: batch ?? forum.batch,
      year_of_study: year_of_study ?? forum.year_of_study,
      reg_no: reg_no ?? forum.reg_no,
      name_of_office: name_of_office ?? forum.name_of_office,
      post: post ?? forum.post,
      joining_date: joining_date ?? forum.joining_date,
      office_address: office_address ?? forum.office_address,
      request_status:
        request_status !== undefined
          ? normalizeRequestStatus(request_status)
          : forum.request_status,
      status:
        status !== undefined
          ? normalizeTinyInt(status, forum.status)
          : forum.status,
      updated_by: req.user?.user_id || 0,
    });

    await forum.save();

    res.json({
      message: "RankForum updated successfully",
      data: forum,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  DELETE 
export const deleteRankForum = async (req, res) => {
  try {
    const forum = await RankForum.findByPk(req.params.id);
    if (!forum) {
      return res.status(404).json({ message: "RankForum not found" });
    }

    await forum.destroy();
    res.json({ message: "RankForum deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  EXCEL
export const downloadRankForumExcel = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      export: exportType, // "all" or undefined
    } = req.query;

    const where = {
      status: 1, //  ONLY status = 1
    };

    let rows;

    if (exportType === "all") {
      // 🔹 FULL DATA EXPORT
      rows = await RankForum.findAll({
        where,
        order: [["rankforum_id", "DESC"]],
      });
    } else {
      // 🔹 PAGINATED EXPORT
      const offset = (page - 1) * limit;

      const result = await RankForum.findAll({
        where,
        limit: Number(limit),
        offset: Number(offset),
        order: [["rankforum_id", "DESC"]],
      });

      rows = result;
    }

    // ============================
    // CREATE EXCEL
    // ============================
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Rank Forum");

    worksheet.columns = [
      { header: "Si.No", key: "si_no", width: 8 },
      { header: "Register No", key: "reg_no", width: 18 },
      { header: "Name", key: "name", width: 22 },
      { header: "Course", key: "course", width: 20 },
      { header: "Batch", key: "batch", width: 15 },
      { header: "Year Of Study", key: "year_of_study", width: 18 },
      { header: "Joining Date", key: "joining_date", width: 18 },
      { header: "Mobile No", key: "mobile_no", width: 18 },
      { header: "Email", key: "email", width: 28 },
      { header: "Request Status", key: "request_status", width: 18 },
      { header: "Office Name", key: "name_of_office", width: 25 },
      { header: "Position", key: "post", width: 22 },
      { header: "Office Address", key: "office_address", width: 30 },
    ];

    // Header styling
    worksheet.getRow(1).font = { bold: true };

    // Status mapper
    const requestStatusMap = {
      1: "Requested",
      2: "Approved",
      3: "Rejected",
    };

    rows.forEach((item, index) => {
      worksheet.addRow({
        si_no: index + 1,
        reg_no: item.reg_no,
        name: item.name,
        course: item.course,
        batch: item.batch,
        year_of_study: item.year_of_study,
        joining_date: item.joining_date,
        mobile_no: item.mobile_no,
        email: item.email,
        request_status: requestStatusMap[item.request_status] || "Requested",
        name_of_office: item.name_of_office,
        post: item.post,
        office_address: item.office_address,
      });
    });

    // ============================
    // RESPONSE HEADERS
    // ============================
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=rank_forum_${
        exportType === "all" ? "full" : `page_${page}`
      }.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Excel export error:", error);
    res.status(500).json({ message: "Failed to export Rank Forum data" });
  }
};
