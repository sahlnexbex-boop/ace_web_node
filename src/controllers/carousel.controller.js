import { Op } from "sequelize";
import Carousel from "../models/carousel.model.js";
import { deleteFile } from "../utils/fileHelper.js";

// helper
const isUnsupportedFile = (mimetype) => {
  return !(
    mimetype.startsWith("image/") ||
    mimetype.startsWith("video/")
  );
};

// create
export const createCarousel = async (req, res) => {
  try {
    const { carousel_title, carousel_sec_title, carousel_description, status, } = req.body;

    const file1 = req.files?.carousel_file?.[0];
    const file2 = req.files?.carousel_mobile_file?.[0];

    if (!file1) {
      return res.status(400).json({ message: "Missing required field: carousel_file" });
    }
    if (isUnsupportedFile(req.files.carousel_file[0].mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Only images and videos are allowed." });
    }

    if (file2 && isUnsupportedFile(req.files.carousel_mobile_file[0].mimetype)) {
      return res.status(400).json({ message: "Invalid mobile file type. Only images and videos are allowed." });
    }

    // if(button_type !== "1" && button_type !== "2") {
    //   return res.status(400).json({ message: "Invalid button type. Only 1 and 2 are allowed." });
    // }

    const carousel_file = `/uploads/carousel/${file1.filename}`;
    const carousel_mobile_file = file2
      ? `/uploads/carousel/${file2.filename}`
      : null;

    const newCarousel = await Carousel.create({
      carousel_title,
      carousel_sec_title,
      carousel_description,
      carousel_file,
      carousel_mobile_file,
      // button_type: Number(button_type),
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({
      message: "Carousel created successfully",
      data: newCarousel,
    });
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
    const { carousel_title, carousel_sec_title, carousel_description, status, } = req.body;

    const file1 = req.files?.carousel_file?.[0];
    const file2 = req.files?.carousel_mobile_file?.[0];

    //  FIX: validate using file1.mimetype instead of req.files.carousel_file.mimetype
    if (file1 && isUnsupportedFile(file1.mimetype)) {
      return res.status(400).json({
        message: "Invalid file type. Only images and videos are allowed."
      });
    }

    //  FIX: validate using file2.mimetype
    if (file2 && isUnsupportedFile(file2.mimetype)) {
      return res.status(400).json({
        message: "Invalid mobile file type. Only images and videos are allowed."
      });
    }

    // if(button_type !== "1" && button_type !== "2") {
    //   return res.status(400).json({ message: "Invalid button type. Only 1 and 2 are allowed." });
    // }

    const newFile = file1
      ? `/uploads/carousel/${file1.filename}`
      : null;

    const newMobileFile = file2
      ? `/uploads/carousel/${file2.filename}`
      : null;

    const carousel = await Carousel.findByPk(id);
    if (!carousel) return res.status(404).json({ message: "Carousel not found" });

    //  delete old files only if new files exist
    if (newFile && carousel.carousel_file) deleteFile(carousel.carousel_file);
    if (newMobileFile && carousel.carousel_mobile_file) deleteFile(carousel.carousel_mobile_file);

    carousel.carousel_title = carousel_title || null;
    carousel.carousel_sec_title = carousel_sec_title || null;
    carousel.carousel_description = carousel_description || null;

    carousel.status = [0, 1].includes(Number(status))
      ? Number(status)
      : carousel.status;

    carousel.carousel_file = newFile || carousel.carousel_file;
    carousel.carousel_mobile_file = newMobileFile || carousel.carousel_mobile_file;

    carousel.updated_by = req.user?.user_id || 0;
    carousel.updated_at = new Date();

    // if (button_type) {
    //   carousel.button_type = Number(button_type);
    // }

    await carousel.save();

    res.json({
      message: "Carousel updated successfully",
      data: carousel,
    });

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
    if (carousel.carousel_mobile_file) deleteFile(carousel.carousel_mobile_file);

    await carousel.destroy();

    res.json({ message: "Carousel deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
