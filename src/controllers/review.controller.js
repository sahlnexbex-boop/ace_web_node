import { Op } from "sequelize";
import Review from "../models/review.model.js";
import Course from "../models/course.model.js";

// Create Review
export const createReview = async (req, res) => {
  try {
    const {
      course_id,
      candidate_name,
      candidate_position,
      place,
      description,
      rating,
      status,
    } = req.body || {};

    if (!candidate_name || !description) {
      return res.status(400).json({ message: "candidate_name and description are required" });
    }

    // Check course_id if provided
    if (course_id) {
      const courseExist = await Course.findByPk(course_id);
      if (!courseExist) {
        return res.status(400).json({ message: "Provided course_id does not exist" });
      }
    }

    const review = await Review.create({
      course_id: course_id || null,
      candidate_name,
      candidate_position,
      place,
      description,
      rating: rating || 0,
      status: status !== undefined ? status : 1,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({
      message: "Review created successfully",
      data: review,
    });
  } catch (err) {
    console.error("Error in createReview:", err);
    res.status(500).json({ error: err.message });
  }
};

// List Reviews
export const getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", course_id, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where.candidate_name = { [Op.like]: `%${search}%` };
    }
    if (course_id) {
      where.course_id = course_id;
    }
    if (status !== undefined) {
      where.status = status;
    }

    const { rows, count } = await Review.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["course_id", "course_name"],
        },
      ],
    });

    res.json({
      message: "Reviews fetched successfully",
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    console.error("Error in getReviews:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get Single Review
export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByPk(id, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["course_id", "course_name"],
        },
      ],
    });

    if (!review) return res.status(404).json({ message: "Review not found" });

    res.json({
      message: "Review found successfully",
      data: review,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Review
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      course_id,
      candidate_name,
      candidate_position,
      place,
      description,
      rating,
      status,
    } = req.body || {};

    const review = await Review.findByPk(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (course_id) {
      const courseExist = await Course.findByPk(course_id);
      if (!courseExist) {
        return res.status(400).json({ message: "Provided course_id does not exist" });
      }
      review.course_id = course_id;
    } else if (course_id === null) {
        review.course_id = null;
    }

    review.candidate_name = candidate_name || review.candidate_name;
    review.candidate_position = candidate_position || review.candidate_position;
    review.place = place || review.place;
    review.description = description || review.description;
    if (rating !== undefined) review.rating = rating;
    if (status !== undefined) review.status = status;
    
    review.updated_by = req.user?.user_id || 0;

    await review.save();

    res.json({
      message: "Review updated successfully",
      data: review,
    });
  } catch (err) {
    console.error("Error in updateReview:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete Review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByPk(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    await review.destroy();

    res.json({
      message: "Review deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
