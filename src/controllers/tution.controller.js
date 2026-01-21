import { Op } from "sequelize";
import Tution from "../models/tution.model.js";
import { deleteFile } from "../utils/fileHelper.js";

const isUnsupportedFile = (mimetype) => {
  // allow only images
  return !mimetype.startsWith("image/");
};

// CREATE
export const createTution = async (req, res) => {
  try {
    const {
      tution_title,
      tution_description,
      start_date,
      end_date,
      start_time,
      end_time,
      status,
    } = req.body;

    const tution_image = req.file
      ? `/uploads/tutions/${req.file.filename}`
      : null;

    if (req.file && isUnsupportedFile(req.file.mimetype)) {
      return res.status(400).json({
        message: "Invalid file type. Only image files are allowed.",
      });
    }

    if (!tution_title || !tution_description || !start_date || !start_time) {
      return res.status(400).json({
        message:
          "tution_title, tution_description, start_date and start_time are required",
      });
    }

    const tution = await Tution.create({
      tution_title,
      tution_description,
      start_date,
      end_date: end_date || null,
      start_time,
      end_time: end_time || null,
      tution_image,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({
      message: "Tution created successfully",
      data: tution,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LIST
export const getTutions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { tution_title: { [Op.like]: `%${search}%` } },
        { tution_description: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status && [0, 1].includes(Number(status))) {
      where.status = Number(status);
    }

    const { rows, count } = await Tution.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["tution_id", "DESC"]],
    });

    res.json({
      message: "Tutions fetched successfully",
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
export const getTutionById = async (req, res) => {
  try {
    const { id } = req.params;
    const tution = await Tution.findByPk(id);
    if (!tution) {
      return res.status(404).json({ message: "Tution not found" });
    }

    res.json({
      message: "Tution fetched successfully",
      data: tution,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
export const updateTution = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tution_title,
      tution_description,
      start_date,
      end_date,
      start_time,
      end_time,
      status,
    } = req.body;

    const newImage = req.file
      ? `/uploads/tutions/${req.file.filename}`
      : null;

    const tution = await Tution.findByPk(id);
    if (!tution) {
      return res.status(404).json({ message: "Tution not found" });
    }

    if (newImage && isUnsupportedFile(req.file.mimetype)) {
      return res.status(400).json({
        message: "Invalid file type. Only image files are allowed.",
      });
    }

    if (newImage && tution.tution_image) {
      deleteFile(tution.tution_image);
    }

    await tution.update({
      tution_title: tution_title ?? tution.tution_title,
      tution_description:
        tution_description ?? tution.tution_description,
      start_date: start_date ?? tution.start_date,
      end_date: end_date !== undefined ? end_date : tution.end_date,
      start_time: start_time ?? tution.start_time,
      end_time: end_time !== undefined ? end_time : tution.end_time,
      tution_image: newImage || tution.tution_image,
      status: [0, 1].includes(Number(status))
        ? Number(status)
        : tution.status,
      updated_by: req.user?.user_id || 0,
    });

    res.json({
      message: "Tution updated successfully",
      data: tution,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
export const deleteTution = async (req, res) => {
  try {
    const { id } = req.params;
    const tution = await Tution.findByPk(id);
    if (!tution) {
      return res.status(404).json({ message: "Tution not found" });
    }

    // delete image file if exists
    if (tution.tution_image) {
      deleteFile(tution.tution_image);
    }

    await tution.destroy();

    res.json({ message: "Tution deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

