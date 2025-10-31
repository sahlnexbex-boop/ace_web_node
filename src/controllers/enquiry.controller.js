import Enquiry from "../models/enquiry.model.js";
import { Op } from "sequelize";

// create
export const createEnquiry = async (req, res) => {
  try {
    let {
      cstmr_name,
      cstmr_email,
      cstmr_phone,
      cstmr_message,
      enquiry_type,
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
    });

    res.json({
      message: "Enquiries fetched successfully",
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Single 
export const getSingleEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.findByPk(id);
    if (!enquiry)
      return res.status(404).json({ message: "Enquiry not found" });
    res.json({ message: "Enquiry fetched successfully", data: enquiry });
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
      enquiry_status,
      status,
      updated_by = 0,
    } = req.body;

    const enquiry = await Enquiry.findByPk(id);
    if (!enquiry)
      return res.status(404).json({ message: "Enquiry not found" });

    if (enquiry_type && ![1, 2, 3, 4].includes(Number(enquiry_type)))
      return res.status(400).json({ message: "Invalid enquiry_type (1–4 only)" });

    if (enquiry_status && ![1, 2, 3].includes(Number(enquiry_status)))
      return res.status(400).json({ message: "Invalid enquiry_status (1–3 only)" });

    await enquiry.update({
      cstmr_name: cstmr_name ?? enquiry.cstmr_name,
      cstmr_email: cstmr_email ?? enquiry.cstmr_email,
      cstmr_phone: cstmr_phone ?? enquiry.cstmr_phone,
      cstmr_message: cstmr_message ?? enquiry.cstmr_message,
      enquiry_type: enquiry_type ?? enquiry.enquiry_type,
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
