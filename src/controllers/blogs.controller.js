import Blog from "../models/blogs.model.js";
import { Op, Sequelize } from "sequelize";
import { deleteFile } from "../utils/fileHelper.js";
import Course from "../models/course.model.js";
import { deslugify, slugify } from "../utils/slugify.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

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

    if (blog_title) {
      const existingBlog = await Blog.findOne({ where: { blog_title } });
      if (existingBlog)
        return res.status(400).json({ message: "Blog title already exists" });
    }

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

// Get single blog by slug
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ message: "Slug is required" });
    }

    // Fetch only active blogs
    const blogs = await Blog.findAll({
      where: { status: 1 },
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["course_id", "course_name"],
        },
      ],
    });

    // Find matching blog by slugified title
    const blog = blogs.find(
      (item) => slugify(item.blog_title) === slug
    );

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({
      message: "Blog fetched successfully",
      data: blog,
    });
  } catch (err) {
    console.error("Slug fetch error:", err);
    res.status(500).json({ error: err.message });
  }
};

//  Get single by id
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

    // Duplicate Name Check
    const duplicate = await Blog.findOne({
      where: {
        [Op.and]: [{ blog_id: { [Op.ne]: id } }, { blog_title }],
      },
    });
    if (duplicate)
      return res.status(400).json({ message: "Blog title already exists" });

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

export const uploadBlogImage = async (req, res) => {
  try {
    console.log(" Upload request received");
    
    if (!req.file) {
      console.log(" No file in request");
      return res.status(400).json({
        error: "No image uploaded",
      });
    }

    const imageUrl = `${process.env.SERVER_URL}/uploads/blogs/editor/${req.file.filename}`;
    
    console.log(" Image uploaded successfully:", imageUrl);

    res.status(200).json({
      url: imageUrl,
      uploaded: true,
    });
  } catch (err) {
    console.error(" Upload error:", err);
    res.status(500).json({
      error: err.message,
      uploaded: false,
    });
  }
};

export const cleanupEditorImages = async (req, res) => {
  try {
    console.log("🧹 Cleanup request received");
    console.log("Request body:", req.body);

    let { imageUrls } = req.body;

    if (!Array.isArray(imageUrls)) {
      return res.status(400).json({
        error: "Invalid request: imageUrls must be an array",
      });
    }

    //  Remove empty or invalid values
    imageUrls = imageUrls.filter(
      (url) => typeof url === "string" && url.trim() !== ""
    );

    if (imageUrls.length === 0) {
      return res.status(200).json({
        success: true,
        deletedFiles: [],
        deletedCount: 0,
      });
    }

    const deletedFiles = [];
    const errors = [];

    for (const imageUrl of imageUrls) {
      try {
        let filename;

        try {
          const urlObj = new URL(imageUrl);
          filename = path.basename(urlObj.pathname);
        } catch {
          errors.push({ url: imageUrl, error: "Invalid URL" });
          continue;
        }

        //  Correct uploads path (outside src)
        const filePath = path.resolve(
          __dirname,
          "../../uploads/blogs/editor",
          filename
        );

        console.log(" Checking:", filePath);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          deletedFiles.push(filename);
          console.log(" Deleted:", filename);
        } else {
          errors.push({
            url: imageUrl,
            error: "File not found",
            path: filePath,
          });
        }
      } catch (err) {
        errors.push({
          url: imageUrl,
          error: err.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      deletedFiles,
      deletedCount: deletedFiles.length,
      errors: errors.length ? errors : undefined,
    });
  } catch (err) {
    console.error(" Cleanup error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Scheduled cleanup
export const scheduledCleanup = async () => {
  try {
    console.log(" Running scheduled editor image cleanup...");

    const editorDir = path.resolve(
      __dirname,
      "../../uploads/blogs/editor"
    );

    try {
      await fs.access(editorDir);
    } catch {
      console.log(" Editor upload directory does not exist");
      return;
    }

    const files = await fs.readdir(editorDir);
    const now = Date.now();
    let deletedCount = 0;

    console.log(` Found ${files.length} files`);

    for (const file of files) {
      const filePath = path.join(editorDir, file);

      try {
        const stats = await fs.stat(filePath);
        if (!stats.isFile()) continue;

        const ageMs = now - stats.mtimeMs;

        if (ageMs > MAX_AGE_MS) {
          await fs.unlink(filePath);
          deletedCount++;
          const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
          console.log(` Deleted ${file} (${ageHours}h old)`);
        }
      } catch (err) {
        console.error(` Failed to process ${file}:`, err.message);
      }
    }

    console.log(
      deletedCount
        ? ` Cleanup complete: ${deletedCount} files removed`
        : " Cleanup complete: No expired files"
    );
  } catch (err) {
    console.error(" Scheduled cleanup fatal error:", err);
  }
};
