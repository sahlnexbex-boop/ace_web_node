import { Op } from "sequelize";
import TutionRegistration from "../models/tutionRegistration.model.js";
import Tution from "../models/tution.model.js";
import ExcelJS from "exceljs";

// CREATE
export const createTutionRegistration = async (req, res) => {
  try {
    const {
      tution_id,
      std_name,
      guardian_name,
      guardian_contact,
      school,
      standard,
      medium,
      request_status,
      status,
    } = req.body;

    if (
      !tution_id ||
      !std_name ||
      !guardian_name ||
      !guardian_contact ||
      !school ||
      !standard ||
      !medium
    ) {
      return res.status(400).json({
        message:
          "tution_id, std_name, guardian_name, guardian_contact, school, standard and medium are required",
      });
    }

    // validate tution_id
    const tution = await Tution.findByPk(tution_id);
    if (!tution) {
      return res.status(400).json({ message: "Invalid tution_id" });
    }

    const allowedMediums = ["english", "malayalam"];
    if (!allowedMediums.includes(String(medium).toLowerCase())) {
      return res.status(400).json({
        message: "Invalid medium. Only 'english' or 'malayalam' allowed",
      });
    }

    const numericRequestStatus = Number(request_status) || 1;
    if (![1, 2, 3].includes(numericRequestStatus)) {
      return res.status(400).json({
        message: "Invalid request_status. Only 1, 2, or 3 are allowed",
      });
    }

    const registration = await TutionRegistration.create({
      tution_id,
      std_name,
      guardian_name,
      guardian_contact,
      school,
      standard,
      medium: String(medium).toLowerCase(),
      request_status: numericRequestStatus,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({
      message: "Tution registration created successfully",
      data: registration,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LIST
export const getTutionRegistrations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      request_status,
      medium,
      tution_id,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { std_name: { [Op.like]: `%${search}%` } },
        { guardian_name: { [Op.like]: `%${search}%` } },
        { school: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status && [0, 1].includes(Number(status))) {
      where.status = Number(status);
    }

    if (request_status && [1, 2, 3].includes(Number(request_status))) {
      where.request_status = Number(request_status);
    }

    if (medium) {
      const allowedMediums = ["english", "malayalam"];
      const m = String(medium).toLowerCase();
      if (allowedMediums.includes(m)) {
        where.medium = m;
      }
    }

    if (tution_id) {
      where.tution_id = Number(tution_id);
    }

    const { rows, count } = await TutionRegistration.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["registration_id", "DESC"]],
      include: [
        {
          model: Tution,
          as: "tution",
          attributes: ["tution_title"],
          required: false,
        },
      ],
    });

    // flatten tution_title into result
    const data = rows.map((item) => {
      const json = item.toJSON();
      const { tution, ...rest } = json;
      return {
        ...rest,
        tution_title: tution?.tution_title || null,
      };
    });

    res.json({
      message: "Tution registrations fetched successfully",
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET SINGLE
export const getTutionRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;
    const registration = await TutionRegistration.findByPk(id, {
      include: [
        {
          model: Tution,
          as: "tution",
          attributes: ["tution_title"],
          required: false,
        },
      ],
    });
    if (!registration) {
      return res.status(404).json({ message: "Tution registration not found" });
    }

    const json = registration.toJSON();
    const { tution, ...rest } = json;
    const data = {
      ...rest,
      tution_title: tution?.tution_title || null,
    };

    res.json({
      message: "Tution registration fetched successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
export const updateTutionRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tution_id,
      std_name,
      guardian_name,
      guardian_contact,
      school,
      standard,
      medium,
      request_status,
      status,
    } = req.body;

    const registration = await TutionRegistration.findByPk(id);
    if (!registration) {
      return res.status(404).json({ message: "Tution registration not found" });
    }

    // determine final tution_id (new or existing)
    const finalTutionId =
      tution_id !== undefined ? Number(tution_id) : registration.tution_id;

    if (!finalTutionId) {
      return res
        .status(400)
        .json({ message: "tution_id is required for registration" });
    }

    // validate final tution_id
    const tution = await Tution.findByPk(finalTutionId);
    if (!tution) {
      return res.status(400).json({ message: "Invalid tution_id" });
    }

    let updatedMedium = registration.medium;
    if (medium !== undefined) {
      const allowedMediums = ["english", "malayalam"];
      const m = String(medium).toLowerCase();
      if (!allowedMediums.includes(m)) {
        return res.status(400).json({
          message: "Invalid medium. Only 'english' or 'malayalam' allowed",
        });
      }
      updatedMedium = m;
    }

    let updatedRequestStatus = registration.request_status;
    if (request_status !== undefined) {
      const numericRequestStatus = Number(request_status);
      if (![1, 2, 3].includes(numericRequestStatus)) {
        return res.status(400).json({
          message: "Invalid request_status. Only 1, 2, or 3 are allowed",
        });
      }
      updatedRequestStatus = numericRequestStatus;
    }

    await registration.update({
      tution_id: finalTutionId,
      std_name: std_name ?? registration.std_name,
      guardian_name: guardian_name ?? registration.guardian_name,
      guardian_contact: guardian_contact ?? registration.guardian_contact,
      school: school ?? registration.school,
      standard: standard ?? registration.standard,
      medium: updatedMedium,
      request_status: updatedRequestStatus,
      status: [0, 1].includes(Number(status))
        ? Number(status)
        : registration.status,
      updated_by: req.user?.user_id || 0,
    });

    res.json({
      message: "Tution registration updated successfully",
      data: registration,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
export const deleteTutionRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const registration = await TutionRegistration.findByPk(id);
    if (!registration) {
      return res.status(404).json({ message: "Tution registration not found" });
    }

    await registration.destroy();

    res.json({ message: "Tution registration deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// EXCEL DOWNLOAD
export const downloadTutionRegistrationExcel = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      export: exportType,
      status,
      request_status,
      medium,
      tution_id,
      search = "",
    } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { std_name: { [Op.like]: `%${search}%` } },
        { guardian_name: { [Op.like]: `%${search}%` } },
        { school: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status && [0, 1].includes(Number(status))) {
      where.status = Number(status);
    }

    if (request_status && [1, 2, 3].includes(Number(request_status))) {
      where.request_status = Number(request_status);
    }

    if (medium) {
      const allowedMediums = ["english", "malayalam"];
      const m = String(medium).toLowerCase();
      if (allowedMediums.includes(m)) {
        where.medium = m;
      }
    }

    if (tution_id) {
      where.tution_id = Number(tution_id);
    }

    const queryOptions = {
      where,
      include: [
        {
          model: Tution,
          as: "tution",
          attributes: ["tution_title"],
          required: false,
        },
      ],
      order: [["registration_id", "DESC"]],
    };

    let rows;

    // FULL EXPORT
    if (exportType === "all") {
      rows = await TutionRegistration.findAll(queryOptions);
    } else {
      // PAGINATED EXPORT
      const offset = (Number(page) - 1) * Number(limit);
      rows = await TutionRegistration.findAll({
        ...queryOptions,
        limit: Number(limit),
        offset,
      });
    }

    // CREATE EXCEL
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tution Registrations");

    worksheet.columns = [
      { header: "Sl.No", key: "si_no", width: 8 },
      { header: "Tution", key: "tution_title", width: 25 },
      { header: "Student Name", key: "std_name", width: 25 },
      { header: "Guardian Name", key: "guardian_name", width: 25 },
      { header: "Guardian Contact", key: "guardian_contact", width: 18 },
      { header: "School", key: "school", width: 28 },
      { header: "Standard", key: "standard", width: 12 },
      { header: "Medium", key: "medium", width: 12 },
      { header: "Request Status", key: "request_status", width: 18 },
      { header: "Status", key: "status", width: 12 },
    ];

    // Header styling
    worksheet.getRow(1).font = { bold: true };

    const requestStatusMap = {
      1: "Requested",
      2: "Ongoing",
      3: "Completed",
    };

    const statusMap = {
      0: "Inactive",
      1: "Active",
    };

    rows.forEach((item, index) => {
      const json = item.toJSON();
      const { tution, ...rest } = json;

      worksheet.addRow({
        si_no: index + 1,
        tution_title: tution?.tution_title || "",
        std_name: rest.std_name || "",
        guardian_name: rest.guardian_name || "",
        guardian_contact: rest.guardian_contact || "",
        school: rest.school || "",
        standard: rest.standard || "",
        medium: rest.medium || "",
        request_status:
          requestStatusMap[rest.request_status] || rest.request_status || "",
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
      `attachment; filename=tution_registrations_${
        exportType === "all" ? "full" : `page_${page}`
      }.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Tution Registration Excel export error:", error);
    res.status(500).json({
      message: "Failed to export tution registration data",
    });
  }
};
