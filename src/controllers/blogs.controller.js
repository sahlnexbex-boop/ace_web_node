import Blog from "../models/blogs.model.js";
import { Op } from "sequelize";
import { deleteFile } from "../utils/fileHelper.js";
import Course from "../models/course.model.js";

const isUnsupportedFile = (mimetype) => {
  return !mimetype.startsWith("image/");
};

//  Create Blog
export const createBlog = async (req, res) => {
  try {
    const {
      blog_title,
      blog_author,
      blog_content,
      publishing_date,
      tags,
      status,
      course_id,
    } = req.body;

    if (!course_id)
      return res.status(400).json({ message: "course_id is required" });

    const courseExists = await Course.findByPk(course_id);
    if (!courseExists)
      return res.status(400).json({ message: "Invalid course_id" });

    const blog_image = req.file
      ? `/uploads/blogs/${req.file.filename}`
      : null;

    if (!blog_title || !blog_author || !blog_content || !publishing_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (req.file && isUnsupportedFile(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Images only allowed" });
    }

    const parsedTags = tags ? JSON.parse(tags) : null;

    const blog = await Blog.create({
      blog_title,
      blog_image,
      blog_author,
      blog_content,
      publishing_date,
      tags: parsedTags,
      course_id,     // ⭐ SAVE
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({ message: "Blog created successfully", data: blog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  list
export const getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status, course_id } = req.query;

    const offset = (page - 1) * limit;

    const where = {};
    if (search) where.blog_title = { [Op.like]: `%${search}%` };
    if (status && [0, 1].includes(Number(status)))
      where.status = Number(status);
    if (course_id) where.course_id = Number(course_id); // ⭐ FILTER BY COURSE

    const { rows, count } = await Blog.findAndCountAll({
      where,
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["course_id", "course_name"], // ⭐ include course name
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["blog_id", "DESC"]],
    });

    res.json({
      message: "Blogs fetched successfully",
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Get single
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByPk(id, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["course_id", "course_name"],
        },
      ],
    });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({
      message: "Blog fetched successfully",
      data: blog,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      blog_title,
      blog_author,
      blog_content,
      publishing_date,
      tags,
      status,
      course_id,     
    } = req.body;

    const newImage = req.file
      ? `/uploads/blogs/${req.file.filename}`
      : null;

    const blog = await Blog.findByPk(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (course_id) {
      const courseExists = await Course.findByPk(course_id);
      if (!courseExists)
        return res.status(400).json({ message: "Invalid course_id" });
      blog.course_id = course_id;
    }

    if (newImage && isUnsupportedFile(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid image file" });
    }

    if (newImage && blog.blog_image) deleteFile(blog.blog_image);

    blog.blog_title = blog_title || blog.blog_title;
    blog.blog_author = blog_author || blog.blog_author;
    blog.blog_content = blog_content || blog.blog_content;
    blog.publishing_date = publishing_date || blog.publishing_date;
    blog.tags = tags ? JSON.parse(tags) : blog.tags;
    blog.status = [0, 1].includes(Number(status))
      ? Number(status)
      : blog.status;
    blog.blog_image = newImage || blog.blog_image;
    blog.updated_by = req.user?.user_id || 0;

    await blog.save();

    res.json({ message: "Blog updated successfully", data: blog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// delete
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.blog_image) deleteFile(blog.blog_image);

    await blog.destroy();
    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
