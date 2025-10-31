import { Op } from "sequelize";
import CurrentAffair from "../models/currentAffair.model.js";
import CourseCategory from "../models/courseCategory.model.js";
import { deleteFile } from "../utils/fileHelper.js";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

const isUnsupportedFile = (mimetype) => {
  return (
    mimetype.startsWith("image/") ||
    mimetype.startsWith("video/")
  );
};

// create
export const createCurrentAffair = async (req, res) => {
  try {
    const {
      affair_title,
      affair_description,
      affair_price,
      publishing_date,
      category_id,
      status,
    } = req.body;

    if (req.file && isUnsupportedFile(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        message: "Images and video files are not supported for Current Affairs.",
      });
    }

    const affair_file = req.file
      ? `${SERVER_URL}/uploads/current_affairs/${req.file.filename}`
      : null;

    if (!affair_title || !publishing_date || !category_id) {
      return res.status(400).json({
        message:
          "Missing required fields: affair_title, publishing_date, category_id",
      });
    }

    const categoryExists = await CourseCategory.findByPk(category_id);
    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid course_category_id" });
    }

    const newAffair = await CurrentAffair.create({
      affair_title,
      affair_description,
      affair_price,
      publishing_date,
      category_id,
      affair_file,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({
      message: "Current Affair created successfully",
      data: newAffair,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// list
export const getCurrentAffairs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status, category_id } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) where.affair_title = { [Op.like]: `%${search}%` };
    if (status && [0, 1].includes(Number(status))) where.status = Number(status);
    if (category_id) where.category_id = category_id;

    const { rows, count } = await CurrentAffair.findAndCountAll({
      where,
      include: [
        {
          model: CourseCategory,
          as: "category",
          attributes: ["category_id", "category_name"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["affair_id", "DESC"]],
    });

    res.json({
      message: "Current Affairs fetched successfully",
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get single
export const getCurrentAffairById = async (req, res) => {
  try {
    const { id } = req.params;

    const affair = await CurrentAffair.findByPk(id, {
      include: [
        {
          model: CourseCategory,
          as: "category",
          attributes: ["category_id", "category_name"],
        },
      ],
    });

    if (!affair) {
      return res.status(404).json({ message: "Current Affair not found" });
    }

    res.json({
      message: "Current Affair fetched successfully",
      data: affair,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update
export const updateCurrentAffair = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      affair_title,
      affair_description,
      affair_price,
      publishing_date,
      category_id,
      status,
    } = req.body;

    const affair = await CurrentAffair.findByPk(id);
    if (!affair)
      return res.status(404).json({ message: "Current Affair not found" });

    if (req.file && isUnsupportedFile(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        message: "Images and video files are not supported for Current Affairs.",
      });
    }

    const newFile = req.file
      ? `${SERVER_URL}/uploads/current_affairs/${req.file.filename}`
      : null;

    const courseCategory = await CourseCategory.findByPk(category_id);
    if (!courseCategory)
      return res.status(400).json({ message: "Invalid course_category_id" });

    if (newFile && affair.affair_file) deleteFile(affair.affair_file);

    affair.affair_title = affair_title || affair.affair_title;
    affair.affair_description = affair_description || affair.affair_description;
    affair.affair_price = affair_price || affair.affair_price;
    affair.publishing_date = publishing_date || affair.publishing_date;
    affair.category_id = category_id || affair.category_id;
    affair.status = [0, 1].includes(Number(status))
      ? Number(status)
      : affair.status;
    affair.affair_file = newFile || affair.affair_file;
    affair.updated_by = req.user?.user_id || 0;
    affair.updated_at = new Date();

    await affair.save();

    res.json({
      message: "Current Affair updated successfully",
      data: affair,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// delete
export const deleteCurrentAffair = async (req, res) => {
  try {
    const { id } = req.params;
    const affair = await CurrentAffair.findByPk(id);
    if (!affair) return res.status(404).json({ message: "Current Affair not found" });

    if (affair.affair_file) deleteFile(affair.affair_file);
    await affair.destroy();

    res.json({ message: "Current Affair deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
