import { Op } from "sequelize";
import VideoClass from "../models/videoClass.model.js";
import CourseCategory from "../models/courseCategory.model.js";
import { deleteFile } from "../utils/fileHelper.js";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

//helper
const isUnsupportedFile = (mimetype) => {
  return !mimetype.startsWith("image/");
};

// create
export const createVideoClass = async (req, res) => {
  try {
    const { class_title, date_time, video_url, category_id, status } = req.body;

    const class_image = req.file
      ? `${SERVER_URL}/uploads/video_classes/${req.file.filename}`
      : null;

    if (!class_title || !date_time || !video_url || !category_id) {
      return res.status(400).json({
        message:
          "Missing required fields: class_title, date_time, video_url, category_id",
      });
    }

    if (category_id) {
      const categoryExists = await CourseCategory.findByPk(category_id);
      if (!categoryExists)
        return res.status(400).json({ message: "Invalid course_category_id" });
    }

    if (isUnsupportedFile(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Only images are allowed." });
    }

    const newClass = await VideoClass.create({
      class_title,
      date_time,
      video_url,
      category_id,
      class_image,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    res
      .status(201)
      .json({ message: "Video Class created successfully", data: newClass });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// list
export const getVideoClasses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      category_id,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) where.class_title = { [Op.like]: `%${search}%` };
    if (status && [0, 1].includes(Number(status)))
      where.status = Number(status);
    if (category_id) where.category_id = category_id;

    const { rows, count } = await VideoClass.findAndCountAll({
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
      order: [["class_id", "DESC"]],
    });

    res.json({
      message: "Video Classes fetched successfully",
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
export const getVideoClassById = async (req, res) => {
  try {
    const { id } = req.params;

    const videoClass = await VideoClass.findByPk(id, {
      include: [
        {
          model: CourseCategory,
          as: "category",
          attributes: ["category_id", "category_name"],
        },
      ],
    });

    if (!videoClass) {
      return res.status(404).json({ message: "Video Class not found" });
    }

    res.json({
      message: "Video Class fetched successfully",
      data: videoClass,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update
export const updateVideoClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { class_title, date_time, video_url, category_id, status } = req.body;

    const videoClass = await VideoClass.findByPk(id);
    if (!videoClass)
      return res.status(404).json({ message: "Video Class not found" });

    if (category_id) {
      const categoryExists = await CourseCategory.findByPk(category_id);
      if (!categoryExists)
        return res.status(400).json({ message: "Invalid course_category_id" });
    }

    const newImage = req.file
      ? `${SERVER_URL}/uploads/video_classes/${req.file.filename}`
      : null;

    if (newImage && videoClass.class_image) deleteFile(videoClass.class_image);

    if (isUnsupportedFile(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Only images are allowed." });
    }

    videoClass.class_title = class_title || videoClass.class_title;
    videoClass.date_time = date_time || videoClass.date_time;
    videoClass.video_url = video_url || videoClass.video_url;
    videoClass.category_id = category_id || videoClass.category_id;
    videoClass.status = [0, 1].includes(Number(status))
      ? Number(status)
      : videoClass.status;
    videoClass.class_image = newImage || videoClass.class_image;
    videoClass.updated_by = req.user?.user_id || 0;
    videoClass.updated_at = new Date();

    await videoClass.save();

    res.json({ message: "Video Class updated successfully", data: videoClass });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// delete
export const deleteVideoClass = async (req, res) => {
  try {
    const { id } = req.params;
    const videoClass = await VideoClass.findByPk(id);
    if (!videoClass)
      return res.status(404).json({ message: "Video Class not found" });

    if (videoClass.class_image) deleteFile(videoClass.class_image);

    await videoClass.destroy();
    res.json({ message: "Video Class deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
