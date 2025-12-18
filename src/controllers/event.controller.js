import { Op } from "sequelize";
import Event from "../models/event.model.js";
import { deleteFile } from "../utils/fileHelper.js";

// helper for checking files
const isUnsupportedFile = (mimetype) => {
  // allow only images
  return !mimetype.startsWith("image/");
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
    const event_image = req.file
      ? `/uploads/events/${req.file.filename}`
      : null;

    if (req.file && isUnsupportedFile(req.file.mimetype)) {
      return res.status(400).json({
        message: "Invalid file type. Only image files are allowed.",
      });
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
    const newImage = req.file
      ? `/uploads/events/${req.file.filename}`
      : null;

    const event = await Event.findByPk(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event_type && ![1, 2].includes(Number(event_type))) {
      return res
        .status(400)
        .json({ message: "Invalid event_type. Only 1 or 2 are allowed." });
    }

    if (newImage && isUnsupportedFile(req.file.mimetype)) {
      return res.status(400).json({
        message: "Invalid file type. Only image files are allowed.",
      });
    }

    if (newImage && event.event_image) deleteFile(event.event_image);

    event.event_title = event_title || event.event_title;
    event.event_description = event_description || event.event_description;
    event.event_type = event_type ? Number(event_type) : event.event_type;
    event.event_location = event_location || event.event_location;
    event.date_time = date_time || event.date_time;
    event.status = [0, 1].includes(Number(status))
      ? Number(status)
      : event.status;
    event.event_image = newImage || event.event_image;
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
    await event.destroy();

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
