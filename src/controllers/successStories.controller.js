import { Op } from "sequelize";
import SuccessStory from "../models/successStories.model.js";
import CourseCategory from "../models/courseCategory.model.js";
import { deleteFile } from "../utils/fileHelper.js";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

// Create
export const createSuccessStory = async (req, res) => {
  try {
    const {
      stories_title,
      name_of_candidate,
      year,
      description,
      course_category_id,
      youtube_video_link,
      status,
    } = req.body;
    const thumbnail_image = req.file
      ? `${SERVER_URL}/uploads/success_stories/${req.file.filename}`
      : null;

    if (!stories_title || !name_of_candidate)
      return res.status(400).json({ message: "Missing required fields" });

    if (course_category_id) {
      const categoryExists = await CourseCategory.findByPk(course_category_id);
      if (!categoryExists)
        return res.status(400).json({ message: "Invalid course_category_id" });
    }

    const story = await SuccessStory.create({
      stories_title,
      name_of_candidate,
      year,
      description,
      course_category_id,
      thumbnail_image,
      youtube_video_link,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({ message: "Success story created", data: story });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// List
export const getSuccessStories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      year,
      course_category_id,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where.stories_title = { [Op.like]: `%${search}%` };
    }

    if (status && [0, 1].includes(Number(status))) {
      where.status = Number(status);
    }

    if (year) {
      where.year = year;
    }

    if (course_category_id) {
      where.course_category_id = course_category_id;
    }

    const { rows, count } = await SuccessStory.findAndCountAll({
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
      order: [["stories_id", "DESC"]],
    });

    // ✅ Response
    res.json({
      message: "Success stories fetched successfully",
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    console.error("Error in getSuccessStories:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get single
export const getSuccessStoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const story = await SuccessStory.findByPk(id, {
      include: [
        {
          model: CourseCategory,
          as: "category",
          attributes: ["category_id", "category_name"],
        },
      ],
    });
    if (!story)
      return res.status(404).json({ message: "Success story not found" });
    res.json({ message: "Success story fetched", data: story });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
export const updateSuccessStory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      stories_title,
      name_of_candidate,
      year,
      description,
      course_category_id,
      youtube_video_link,
      status,
    } = req.body;
    const newThumbnail = req.file
      ? `${SERVER_URL}/uploads/success_stories/${req.file.filename}`
      : null;

    const story = await SuccessStory.findByPk(id);
    if (!story)
      return res.status(404).json({ message: "Success story not found" });

    if (course_category_id) {
      const categoryExists = await CourseCategory.findByPk(course_category_id);
      if (!categoryExists)
        return res.status(400).json({ message: "Invalid course_category_id" });
    }

    if (newThumbnail && story.thumbnail_image)
      deleteFile(story.thumbnail_image);

    story.stories_title = stories_title || story.stories_title;
    story.name_of_candidate = name_of_candidate || story.name_of_candidate;
    story.year = year || story.year;
    story.description = description || story.description;
    story.course_category_id = course_category_id || story.course_category_id;
    story.youtube_video_link = youtube_video_link || story.youtube_video_link;
    story.status = [0, 1].includes(Number(status))
      ? Number(status)
      : story.status;
    story.thumbnail_image = newThumbnail || story.thumbnail_image;
    story.updated_by = req.user?.user_id || 0;
    story.updated_at = new Date();

    await story.save();
    res.json({ message: "Success story updated", data: story });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
export const deleteSuccessStory = async (req, res) => {
  try {
    const { id } = req.params;
    const story = await SuccessStory.findByPk(id);
    if (!story)
      return res.status(404).json({ message: "Success story not found" });

    if (story.thumbnail_image) deleteFile(story.thumbnail_image);

    await story.destroy();
    res.json({ message: "Success story deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
