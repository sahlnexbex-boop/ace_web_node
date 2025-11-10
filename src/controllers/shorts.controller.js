import { Op } from "sequelize";
import Shorts from "../models/shorts.model.js";
import { deleteFile } from "../utils/fileHelper.js";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

const isUnsupportedFile = (mimetype) => {
  return !mimetype.startsWith("image/");
};

// create
export const createShort = async (req, res) => {
  try {
    const { shorts_title, status, shorts_link } = req.body;
    const shorts_file = req.file
      ? `${SERVER_URL}/uploads/shorts/${req.file.filename}`
      : null;

    if (!shorts_file) {
      return res
        .status(400)
        .json({ message: "Missing required field: shorts_file" });
    }

     if (isUnsupportedFile(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Videos only allowed" });
    }

    const newShort = await Shorts.create({
      shorts_title,
      shorts_link,
      shorts_file,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    res
      .status(201)
      .json({ message: "Short created successfully", data: newShort });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// list
export const getAllShorts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (search) where.shorts_title = { [Op.like]: `%${search}%` };
    if (status && [0, 1].includes(Number(status)))
      where.status = Number(status);

    const { rows, count } = await Shorts.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["shorts_id", "DESC"]],
    });

    res.json({
      message: "Shorts fetched successfully",
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// single
export const getShortById = async (req, res) => {
  try {
    const { id } = req.params;
    const short = await Shorts.findByPk(id);
    if (!short) return res.status(404).json({ message: "Short not found" });

    res.json({ message: "Short fetched successfully", data: short });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update
export const updateShort = async (req, res) => {
  try {
    const { id } = req.params;
    const { shorts_title, status, shorts_link } = req.body;
    const newFile = req.file
      ? `${SERVER_URL}/uploads/shorts/${req.file.filename}`
      : null;

    const short = await Shorts.findByPk(id);
    if (!short) return res.status(404).json({ message: "Short not found" });

    if (newFile && short.shorts_file) deleteFile(short.shorts_file);

    if(newFile && isUnsupportedFile(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Videos only allowed" });
    }

    short.shorts_title = shorts_title || short.shorts_title;
    short.shorts_link = shorts_link || short.short_link;
    short.status = [0, 1].includes(Number(status))
      ? Number(status)
      : short.status;
    short.shorts_file = newFile || short.shorts_file;
    short.updated_by = req.user?.user_id || 0;
    short.updated_at = new Date();

    await short.save();

    res.json({ message: "Short updated successfully", data: short });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// delete
export const deleteShort = async (req, res) => {
  try {
    const { id } = req.params;
    const short = await Shorts.findByPk(id);
    if (!short) return res.status(404).json({ message: "Short not found" });

    if (short.shorts_file) deleteFile(short.shorts_file);
    await short.destroy();

    res.json({ message: "Short deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
