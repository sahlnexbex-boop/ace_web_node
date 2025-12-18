import { Op } from "sequelize";
import News from "../models/news.model.js";
import { deleteFile } from "../utils/fileHelper.js";

const isUnsupportedFile = (mimetype) => {
  return !mimetype.startsWith("image/");
};

const normalizeDescription = (text = "") =>
  text.replace(/\\n/g, "\n").replace(/\\r/g, "");


// create
export const createNews = async (req, res) => {
  try {
    const { news_title, date_time, news_description, status } = req.body;
    const news_image = req.file ? `/uploads/news/${req.file.filename}` : null;

    if (isUnsupportedFile(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Only images are allowed." });
    }

    if (!news_title || !date_time) {
      return res.status(400).json({ message: "Missing required fields: news_title or date_time" });
    }
    const description = normalizeDescription(news_description);

    const news = await News.create({
      news_title,
      date_time,
      news_description: description,
      news_image,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({ message: "News created successfully", data: news });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get list
export const getAllNews = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (search) where.news_title = { [Op.like]: `%${search}%` };
    if (status && [0, 1].includes(Number(status))) where.status = Number(status);

    const { rows, count } = await News.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["news_id", "DESC"]],
    });

    res.json({
      message: "News fetched successfully",
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
export const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findByPk(id);
    if (!news) return res.status(404).json({ message: "News not found" });

    res.json({ message: "News fetched successfully", data: news });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update
export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { news_title, date_time, news_description, status } = req.body;
    const newImage = req.file ? `/uploads/news/${req.file.filename}` : null;

    if(newImage && isUnsupportedFile(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Only images are allowed." });
    }

    const news = await News.findByPk(id);
    if (!news) return res.status(404).json({ message: "News not found" });

    if (newImage && news.news_image) deleteFile(news.news_image);

    const description = normalizeDescription(news_description);

    news.news_title = news_title || news.news_title;
    news.date_time = date_time || news.date_time;
    news.news_description = description || news.news_description;
    news.status = [0, 1].includes(Number(status)) ? Number(status) : news.status;
    news.news_image = newImage || news.news_image;
    news.updated_by = req.user?.user_id || 0;
    news.updated_at = new Date();

    await news.save();

    res.json({ message: "News updated successfully", data: news });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// delete
export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findByPk(id);
    if (!news) return res.status(404).json({ message: "News not found" });

    if (news.news_image) deleteFile(news.news_image);
    await news.destroy();

    res.json({ message: "News deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
