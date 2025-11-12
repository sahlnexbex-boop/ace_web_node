import { Op } from "sequelize";
import Testimonial from "../models/testimonial.model.js";
import { deleteFile } from "../utils/fileHelper.js";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

const isUnsupportedFile = (mimetype) => {
  return !mimetype.startsWith("image/");
};

// Create
export const createTestimonial = async (req, res) => {
  try {
    const { name_of_candidate, position_of_candidate, content, status } = req.body;
    const image_of_candidate = req.file ? `${SERVER_URL}/uploads/testimonials/${req.file.filename}` : null;

    if (isUnsupportedFile(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Only images are allowed." });
    }

    if (!name_of_candidate || !content)
      return res.status(400).json({ message: "Missing required fields" });

    const testimonial = await Testimonial.create({
      name_of_candidate,
      position_of_candidate,
      image_of_candidate,
      content,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({ message: "Testimonial created successfully", data: testimonial });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// List 
export const getTestimonials = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) where.name_of_candidate = { [Op.like]: `%${search}%` };
    if (status && [0, 1].includes(Number(status))) where.status = Number(status);

    const { rows, count } = await Testimonial.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["testimonial_id", "DESC"]],
    });

    res.json({
      message: "Testimonials fetched successfully",
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
export const getTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByPk(id);
    if (!testimonial) return res.status(404).json({ message: "Testimonial not found" });

    res.json({ message: "Testimonial fetched successfully", data: testimonial });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name_of_candidate, position_of_candidate, content, status } = req.body;
    const newImage = req.file ? `${SERVER_URL}/uploads/testimonials/${req.file.filename}` : null;

    const testimonial = await Testimonial.findByPk(id);
    if (!testimonial) return res.status(404).json({ message: "Testimonial not found" });

    if (newImage && testimonial.image_of_candidate) deleteFile(testimonial.image_of_candidate);
    
    if(newImage && isUnsupportedFile(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Only images are allowed." });
    }

    testimonial.name_of_candidate = name_of_candidate || testimonial.name_of_candidate;
    testimonial.position_of_candidate = position_of_candidate || testimonial.position_of_candidate;
    testimonial.content = content || testimonial.content;
    testimonial.status = [0, 1].includes(Number(status)) ? Number(status) : testimonial.status;
    testimonial.image_of_candidate = newImage || testimonial.image_of_candidate;
    testimonial.updated_by = req.user?.user_id || 0;
    testimonial.updated_at = new Date();

    await testimonial.save();

    res.json({ message: "Testimonial updated successfully", data: testimonial });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByPk(id);
    if (!testimonial) return res.status(404).json({ message: "Testimonial not found" });

    if (testimonial.image_of_candidate) deleteFile(testimonial.image_of_candidate);

    await testimonial.destroy();
    res.json({ message: "Testimonial deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
