import { Op } from "sequelize";
import Carousel from "../models/carousel.model.js";
import { deleteFile } from "../utils/fileHelper.js";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

// create
export const createCarousel = async (req, res) => {
  try {
    const { carousel_title, carousel_sec_title, carousel_description, status } = req.body;
    const carousel_file = req.file ? `${SERVER_URL}/uploads/carousel/${req.file.filename}` : null;

    if (!carousel_title) {
      return res.status(400).json({ message: "Missing required field: carousel_title" });
    }

    const newCarousel = await Carousel.create({
      carousel_title,
      carousel_sec_title,
      carousel_description,
      carousel_file,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({ message: "Carousel created successfully", data: newCarousel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// list
export const getAllCarousels = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (search) where.carousel_title = { [Op.like]: `%${search}%` };
    if (status && [0, 1].includes(Number(status))) where.status = Number(status);

    const { rows, count } = await Carousel.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["carousel_id", "DESC"]],
    });

    res.json({
      message: "Carousels fetched successfully",
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
export const getCarouselById = async (req, res) => {
  try {
    const { id } = req.params;
    const carousel = await Carousel.findByPk(id);
    if (!carousel) return res.status(404).json({ message: "Carousel not found" });

    res.json({ message: "Carousel fetched successfully", data: carousel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update
export const updateCarousel = async (req, res) => {
  try {
    const { id } = req.params;
    const { carousel_title, carousel_sec_title, carousel_description, status } = req.body;
    const newFile = req.file ? `${SERVER_URL}/uploads/carousel/${req.file.filename}` : null;

    const carousel = await Carousel.findByPk(id);
    if (!carousel) return res.status(404).json({ message: "Carousel not found" });

    if (newFile && carousel.carousel_file) deleteFile(carousel.carousel_file);

    carousel.carousel_title = carousel_title || carousel.carousel_title;
    carousel.carousel_sec_title = carousel_sec_title || carousel.carousel_sec_title;
    carousel.carousel_description = carousel_description || carousel.carousel_description;
    carousel.status = [0, 1].includes(Number(status)) ? Number(status) : carousel.status;
    carousel.carousel_file = newFile || carousel.carousel_file;
    carousel.updated_by = req.user?.user_id || 0;
    carousel.updated_at = new Date();

    await carousel.save();

    res.json({ message: "Carousel updated successfully", data: carousel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//delete
export const deleteCarousel = async (req, res) => {
  try {
    const { id } = req.params;
    const carousel = await Carousel.findByPk(id);
    if (!carousel) return res.status(404).json({ message: "Carousel not found" });

    if (carousel.carousel_file) deleteFile(carousel.carousel_file);
    await carousel.destroy();

    res.json({ message: "Carousel deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
