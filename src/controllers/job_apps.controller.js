import JobApplication from "../models/job_apps.model.js";
import Job from "../models/jobs.model.js";
import { Op, Sequelize } from "sequelize";
import { deleteFile } from "../utils/fileHelper.js";
import ExcelJS from "exceljs";

// const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

const isUnsupportedFile = (file) =>
  file && !file.mimetype.startsWith("application/pdf");

// Validate application_status
const validateStatus = (status) => [1, 2, 3].includes(Number(status));

function formatJobAppBranches(jobApp, branchMap) {
  const appData = jobApp.toJSON();
  let branchesList = [];
  if (appData.applied_branches) {
    try {
      branchesList = typeof appData.applied_branches === "string" ? JSON.parse(appData.applied_branches) : appData.applied_branches;
    } catch (e) {
      branchesList = [];
    }
  }
  if (Array.isArray(branchesList)) {
    appData.applied_branches = branchesList.map(id => ({
      branch_id: Number(id),
      branch_name: branchMap[id] || "Unknown",
    }));
  } else {
    appData.applied_branches = [];
  }
  return appData;
}

// CREATE
export const createJobApplication = async (req, res) => {
  try {
    let {
      candidate_name,
      candidate_email,
      candidate_phone,
      candidate_address,
      job_id,
      cover_letter,
      application_status,
      application_date,
      status,
      applied_branches,
    } = req.body;

    /* ---------------- FILE VALIDATION ---------------- */
    if (!req.file)
      return res.status(400).json({ message: "Resume file is required" });

    if (isUnsupportedFile(req.file))
      return res
        .status(400)
        .json({ message: "Invalid file type. Only PDF allowed" });

    /* ---------------- DEFAULT application_status ---------------- */
    application_status =
      application_status !== undefined
        ? Number(application_status)
        : 1;

    if (!validateStatus(application_status)) {
      return res.status(400).json({
        message: "Invalid application_status. Only 1, 2, or 3 allowed",
      });
    }

    /* ---------------- DEFAULT application_date ---------------- */
    const today = new Date().toISOString().split("T")[0];
    application_date = application_date || today;

    /* ---------------- JOB VALIDATION ---------------- */
    const job = await Job.findByPk(job_id);
    if (!job)
      return res.status(400).json({ message: "Invalid job_id" });

    let parsedAppliedBranches = null;
    if (applied_branches) {
      try {
        parsedAppliedBranches = typeof applied_branches === "string" ? JSON.parse(applied_branches) : applied_branches;
      } catch (e) {
        parsedAppliedBranches = applied_branches;
      }
    }

    /* ---------------- CREATE RECORD ---------------- */
    const resume_file = `/uploads/job_applications/${req.file.filename}`;

    const app = await JobApplication.create({
      candidate_name,
      candidate_email,
      candidate_phone,
      candidate_address,
      job_id,
      applied_branches: parsedAppliedBranches,
      resume_file,
      cover_letter,
      application_status,
      application_date,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    return res.status(201).json({
      message: "Job Application created successfully",
      data: app,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

// LIST
export const getJobApplications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      application_status,
      job_id,
      branch,
    } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { candidate_name: { [Op.like]: `%${search}%` } },
        { candidate_email: { [Op.like]: `%${search}%` } },
        { candidate_phone: { [Op.like]: `%${search}%` } },
      ];
    }
    if (status !== undefined && status !== "") {
      where.status = Number(status);
    }
    if (application_status !== undefined && application_status !== "") {
      where.application_status = Number(application_status);
    }
    if (job_id !== undefined && job_id !== "") {
      where.job_id = Number(job_id);
    }
    if (branch !== undefined && branch !== "") {
      where[Op.and] = Sequelize.literal(`JSON_CONTAINS(applied_branches, '${Number(branch)}')`);
    }

    const jobInclude = {
      model: Job,
      attributes: ["job_id", "job_title"],
      required: false,
    };

    const { rows, count } = await JobApplication.findAndCountAll({
      where,
      include: [jobInclude],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["application_id", "DESC"]],
    });

    // Fetch branches for formatting mapping
    const branches = await JobApplication.sequelize.query(
      "SELECT branch_id, branch_name FROM mst_branches;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const branchMap = {};
    branches.forEach((b) => {
      branchMap[b.branch_id] = b.branch_name;
    });

    const formattedRows = rows.map(row => formatJobAppBranches(row, branchMap));

    res.json({
      message: "Job Applications fetched successfully",
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data: formattedRows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET SINGLE
export const getJobApplicationById = async (req, res) => {
  try {
    const app = await JobApplication.findByPk(req.params.id, {
      include: [
        {
          model: Job,
          attributes: ["job_id", "job_title"],
        },
      ],
    });

    if (!app)
      return res.status(404).json({ message: "Job Application not found" });

    // Fetch branches for formatting mapping
    const branches = await JobApplication.sequelize.query(
      "SELECT branch_id, branch_name FROM mst_branches;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const branchMap = {};
    branches.forEach((b) => {
      branchMap[b.branch_id] = b.branch_name;
    });

    const formattedApp = formatJobAppBranches(app, branchMap);

    res.json({ message: "Fetched successfully", data: formattedApp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
export const updateJobApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await JobApplication.findByPk(id);
    if (!app)
      return res.status(404).json({ message: "Job Application not found" });

    const {
      candidate_name,
      candidate_email,
      candidate_phone,
      candidate_address,
      job_id,
      cover_letter,
      application_status,
      application_date,
      status,
      applied_branches,
    } = req.body;

    if (application_status && !validateStatus(application_status))
      return res
        .status(400)
        .json({ message: "Invalid application_status. Only 1, 2, or 3 allowed" });

    if (job_id) {
      const job = await Job.findByPk(job_id);
      if (!job) return res.status(400).json({ message: "Invalid job_id" });
      app.job_id = job_id;
    }

    if (req.file) {
      if (isUnsupportedFile(req.file))
        return res
          .status(400)
          .json({ message: "Invalid file type. Only PDF allowed" });

      if (app.resume_file) deleteFile(app.resume_file);
      app.resume_file = `/uploads/job_applications/${req.file.filename}`;
    }

    if (applied_branches !== undefined) {
      let parsedAppliedBranches = null;
      try {
        parsedAppliedBranches = typeof applied_branches === "string" ? JSON.parse(applied_branches) : applied_branches;
      } catch (e) {
        parsedAppliedBranches = applied_branches;
      }
      app.applied_branches = parsedAppliedBranches;
    }

    app.candidate_name = candidate_name || app.candidate_name;
    app.candidate_email = candidate_email || app.candidate_email;
    app.candidate_phone = candidate_phone || app.candidate_phone;
    app.candidate_address = candidate_address || app.candidate_address;
    app.cover_letter = cover_letter || app.cover_letter;
    app.application_date = application_date || app.application_date;
    app.application_status = application_status || app.application_status;
    app.status = [0, 1].includes(Number(status))
      ? Number(status)
      : app.status;
    app.updated_by = req.user?.user_id || 0;

    await app.save();

    res.json({ message: "Job Application updated successfully", data: app });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
export const deleteJobApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await JobApplication.findByPk(id);
    if (!app)
      return res.status(404).json({ message: "Job Application not found" });

    if (app.resume_file) deleteFile(app.resume_file);

    await app.destroy();
    res.json({ message: "Job Application deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Excel Download
export const downloadJobApplicationExcel = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      application_status,
      job_id,
      branch,
      export: exportType,
    } = req.query;

    let rows;

    const where = {};
    if (search) {
      where[Op.or] = [
        { candidate_name: { [Op.like]: `%${search}%` } },
        { candidate_email: { [Op.like]: `%${search}%` } },
        { candidate_phone: { [Op.like]: `%${search}%` } },
      ];
    }
    if (status !== undefined && status !== "") {
      where.status = Number(status);
    }
    if (application_status !== undefined && application_status !== "") {
      where.application_status = Number(application_status);
    }
    if (job_id !== undefined && job_id !== "") {
      where.job_id = Number(job_id);
    }

    const jobInclude = {
      model: Job,
      attributes: ["job_title"],
      required: false,
    };

    if (branch !== undefined && branch !== "") {
      where[Op.and] = Sequelize.literal(`JSON_CONTAINS(applied_branches, '${Number(branch)}')`);
    }

    const queryOptions = {
      where,
      include: [jobInclude],
      order: [["application_id", "DESC"]],
    };

    // FULL EXPORT
    if (exportType === "all") {
      rows = await JobApplication.findAll(queryOptions);
    }
    // PAGINATED EXPORT
    else {
      const offset = (Number(page) - 1) * Number(limit);

      rows = await JobApplication.findAll({
        ...queryOptions,
        limit: Number(limit),
        offset,
      });
    }    // Fetch branch names for mapping
    const branches = await JobApplication.sequelize.query(
      "SELECT branch_id, branch_name FROM mst_branches;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const branchMap = {};
    branches.forEach((b) => {
      branchMap[b.branch_id] = b.branch_name;
    });

    // CREATE EXCEL
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Job Applications");

    worksheet.columns = [
      { header: "SI.No", key: "si_no", width: 8 },
      { header: "Candidate Name", key: "candidate_name", width: 25 },
      { header: "Phone", key: "candidate_phone", width: 18 },
      { header: "Address", key: "candidate_address", width: 35 },
      { header: "Applied For", key: "job_title", width: 30 },
      { header: "Branch", key: "job_branch", width: 25 },
      { header: "Application Date", key: "application_date", width: 18 },
      { header: "Request Status", key: "application_status", width: 18 },
      { header: "Status", key: "status", width: 12 },
    ];

    // Header styling
    worksheet.getRow(1).font = { bold: true };

    const applicationStatusMap = {
      1: "Requested",
      2: "Ongoing",
      3: "Closed",
    };

    const statusMap = {
      0: "Inactive",
      1: "Active",
    };

    rows.forEach((item, index) => {
      const appData = item.toJSON();
      const { Job: job, ...rest } = appData;

      let branchNames = "—";
      let branchesList = [];
      if (rest.applied_branches) {
        try {
          branchesList = typeof rest.applied_branches === "string" 
            ? JSON.parse(rest.applied_branches) 
            : rest.applied_branches;
        } catch (e) {
          branchesList = [];
        }
      }
      if (Array.isArray(branchesList) && branchesList.length > 0) {
        branchNames = branchesList
          .map((id) => branchMap[id] || id)
          .join(", ");
      }

      worksheet.addRow({
        si_no: index + 1,
        candidate_name: rest.candidate_name || "",
        candidate_phone: rest.candidate_phone || "",
        candidate_address: rest.candidate_address || "",
        job_title: job?.job_title || "—",
        job_branch: branchNames,
        application_date: rest.application_date
          ? new Date(rest.application_date).toLocaleDateString("en-GB")
          : "",
        application_status: applicationStatusMap[rest.application_status] || "Requested",
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
      `attachment; filename=job_applications_${exportType === "all" ? "full" : `page_${page}`
      }.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Job Application Excel export error:", error);
    res.status(500).json({
      message: "Failed to export job application data",
    });
  }
};
