import { Op } from "sequelize";
import Event from "../models/event.model.js";
import { deleteFile } from "../utils/fileHelper.js";

// helper for checking files
const isUnsupportedFile = (mimetype) => {
  // allow only images
  return !mimetype.startsWith("image/");
};

// normalize values stored in DB to an array
const normalizeToArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      return [val];
    }
  }
  return [val];
};

// create
export const createEvent = async (req, res) => {
  try {
    const {
      event_title,
      event_description,
      event_type,
      event_location,
      date_time,
      status,
    } = req.body;
    const event_image = req.files?.event_image?.[0]
      ? `/uploads/events/${req.files.event_image[0].filename}`
      : null;
    const otherFiles = req.files?.other_images || req.files?.others_images || null;
    const other_images = otherFiles
      ? otherFiles.map((file) => `/uploads/events/${file.filename}`)
      : null;

    if (req.files?.event_image?.[0] && isUnsupportedFile(req.files.event_image[0].mimetype)) {
      return res.status(400).json({
        message: "Invalid file type for event_image. Only image files are allowed.",
      });
    }

    if (otherFiles) {
      for (const file of otherFiles) {
        if (isUnsupportedFile(file.mimetype)) {
          return res.status(400).json({
            message: "Invalid file type in other_images. Only image files are allowed.",
          });
        }
      }
    }

    if (
      !event_title ||
      !event_description ||
      !event_type ||
      !event_location ||
      !date_time
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (![1, 2].includes(Number(event_type))) {
      return res
        .status(400)
        .json({ message: "Invalid event_type. Only 1 or 2 are allowed." });
    }

    const event = await Event.create({
      event_title,
      event_description,
      event_type: Number(event_type),
      event_location,
      date_time,
      event_image,
      other_images,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    res
      .status(201)
      .json({ message: "Event created successfully", data: event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// list all
export const getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status, event_type } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) where.event_title = { [Op.like]: `%${search}%` };
    if (status && [0, 1].includes(Number(status)))
      where.status = Number(status);
    if (event_type && [1, 2].includes(Number(event_type)))
      where.event_type = Number(event_type);

    const { rows, count } = await Event.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["event_id", "DESC"]],
    });

    res.json({
      message: "Events fetched successfully",
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
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event fetched successfully", data: event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      event_title,
      event_description,
      event_type,
      event_location,
      date_time,
      status,
    } = req.body;
    const newImage = req.files?.event_image?.[0]
      ? `/uploads/events/${req.files.event_image[0].filename}`
      : null;
    const newOtherFiles = req.files?.other_images || req.files?.others_images || null;
    const newOtherImages = newOtherFiles
      ? newOtherFiles.map((file) => `/uploads/events/${file.filename}`)
      : null;

    const event = await Event.findByPk(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event_type && ![1, 2].includes(Number(event_type))) {
      return res
        .status(400)
        .json({ message: "Invalid event_type. Only 1 or 2 are allowed." });
    }

    if (req.files?.event_image?.[0] && isUnsupportedFile(req.files.event_image[0].mimetype)) {
      return res.status(400).json({
        message: "Invalid file type for event_image. Only image files are allowed.",
      });
    }

    if (newOtherFiles) {
      for (const file of newOtherFiles) {
        if (isUnsupportedFile(file.mimetype)) {
          return res.status(400).json({
            message: "Invalid file type in other_images. Only image files are allowed.",
          });
        }
      }
    }

    if (newImage && event.event_image) deleteFile(event.event_image);
    if (newOtherImages && event.other_images) {
      const prev = normalizeToArray(event.other_images);
      prev.forEach((imagePath) => deleteFile(imagePath));
    }

    event.event_title = event_title || event.event_title;
    event.event_description = event_description || event.event_description;
    event.event_type = event_type ? Number(event_type) : event.event_type;
    event.event_location = event_location || event.event_location;
    event.date_time = date_time || event.date_time;
    event.status = [0, 1].includes(Number(status))
      ? Number(status)
      : event.status;
    event.event_image = newImage || event.event_image;
    event.other_images = newOtherImages || event.other_images;
    event.updated_by = req.user?.user_id || 0;
    event.updated_at = new Date();

    await event.save();

    res.json({ message: "Event updated successfully", data: event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// delete
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.event_image) deleteFile(event.event_image);
    if (event.other_images) {
      const imgs = normalizeToArray(event.other_images);
      imgs.forEach((imagePath) => deleteFile(imagePath));
    }
    await event.destroy();

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
