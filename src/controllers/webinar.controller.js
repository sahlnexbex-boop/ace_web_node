import { Op } from "sequelize";
import Webinar from "../models/webinar.model.js";
import CourseCategory from "../models/courseCategory.model.js";
import { deleteFile } from "../utils/fileHelper.js";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

const isUnsupportedFile = (mimetype) => {
  return !mimetype.startsWith("image/");
};

// create
export const createWebinar = async (req, res) => {
  try {
    const {
      webinar_title,
      date_time,
      webinar_duration,
      course_category_id,
      speaker_name,
      speaker_position,
      webinar_description,
      webinar_link,
      status,
    } = req.body;

    const webinar_image = req.file ? `${SERVER_URL}/uploads/webinars/${req.file.filename}` : null;

    if (!webinar_title || !date_time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (isUnsupportedFile(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Only images are allowed." });
    }

    if (course_category_id) {
      const category = await CourseCategory.findByPk(course_category_id);
      if (!category) return res.status(400).json({ message: "Invalid course_category_id" });
    }

    const webinar = await Webinar.create({
      webinar_title,
      date_time,
      webinar_duration,
      course_category_id,
      speaker_name,
      speaker_position,
      webinar_description,
      webinar_link,
      webinar_image,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({ message: "Webinar created successfully", data: webinar });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// list
export const getWebinars = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status, course_category_id } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) where.webinar_title = { [Op.like]: `%${search}%` };
    if (status && [0, 1].includes(Number(status))) where.status = Number(status);
    if (course_category_id) where.course_category_id = course_category_id;

    const { rows, count } = await Webinar.findAndCountAll({
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
      order: [["webinar_id", "DESC"]],
    });

    res.json({
      message: "Webinars fetched successfully",
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// single get
export const getWebinarById = async (req, res) => {
  try {
    const { id } = req.params;
    const webinar = await Webinar.findByPk(id, {
      include: [
        {
          model: CourseCategory,
          as: "category",
          attributes: ["category_id", "category_name"],
        },
      ],
    });
    if (!webinar) return res.status(404).json({ message: "Webinar not found" });
    res.json({ message: "Webinar fetched successfully", data: webinar });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update
export const updateWebinar = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      webinar_title,
      date_time,
      webinar_duration,
      course_category_id,
      speaker_name,
      speaker_position,
      webinar_description,
      webinar_link,
      status,
    } = req.body;

    const newImage = req.file ? `${SERVER_URL}/uploads/webinars/${req.file.filename}` : null;

    const webinar = await Webinar.findByPk(id);
    if (!webinar) return res.status(404).json({ message: "Webinar not found" });

    if(newImage && isUnsupportedFile(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Only images are allowed." });
    }

    // Check category if provided
    if (course_category_id) {
      const category = await CourseCategory.findByPk(course_category_id);
      if (!category) return res.status(400).json({ message: "Invalid course_category_id" });
    }

    if (newImage && webinar.webinar_image) deleteFile(webinar.webinar_image);

    webinar.webinar_title = webinar_title || webinar.webinar_title;
    webinar.date_time = date_time || webinar.date_time;
    webinar.webinar_duration = webinar_duration || webinar.webinar_duration;
    webinar.course_category_id = course_category_id || webinar.course_category_id;
    webinar.speaker_name = speaker_name || webinar.speaker_name;
    webinar.speaker_position = speaker_position || webinar.speaker_position;
    webinar.webinar_description = webinar_description || webinar.webinar_description;
    webinar.webinar_link = webinar_link || webinar.webinar_link;
    webinar.status = [0, 1].includes(Number(status)) ? Number(status) : webinar.status;
    webinar.webinar_image = newImage || webinar.webinar_image;
    webinar.updated_by = req.user?.user_id || 0;
    webinar.updated_at = new Date();

    await webinar.save();

    res.json({ message: "Webinar updated successfully", data: webinar });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// delete
export const deleteWebinar = async (req, res) => {
  try {
    const { id } = req.params;
    const webinar = await Webinar.findByPk(id);
    if (!webinar) return res.status(404).json({ message: "Webinar not found" });

    if (webinar.webinar_image) deleteFile(webinar.webinar_image);
    await webinar.destroy();

    res.json({ message: "Webinar deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
