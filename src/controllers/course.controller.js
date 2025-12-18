import { Op } from "sequelize";
import Course from "../models/course.model.js";
import CourseCategory from "../models/courseCategory.model.js";
import { deleteFile } from "../utils/fileHelper.js";

// Create Course
export const createCourse = async (req, res) => {
  try {
    const {
      course_name,
      course_description,
      course_rating,
      course_category_id,
      course_duration,
      course_fee,
      course_overview,
      course_syllabus,
      course_study_material,
      status,
    } = req.body;

    if (!course_name || !course_category_id)
      return res.status(400).json({ message: "Course name and category required" });

    const exists = await Course.findOne({ where: { course_name } });
    if (exists) return res.status(400).json({ message: "Course already exists" });

    const category = await CourseCategory.findByPk(course_category_id);
    if (!category) return res.status(400).json({ message: "Invalid category" });

    if (course_rating && Number(course_rating) > 5)
      return res.status(400).json({ message: "Max rating is 5" });

    let course_image = null;
    if (req.files?.course_image) {
      const imageFile = req.files.course_image[0];
      const allowedImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedImageTypes.includes(imageFile.mimetype)) {
        return res.status(400).json({
          message: "Invalid image type. Only JPG, PNG, GIF, WEBP allowed.",
        });
      }
      course_image = `/uploads/course/${imageFile.filename}`;
    }

    let course_syllabus_file = null;
    if (req.files?.course_syllabus_file) {
      const syllabusFile = req.files.course_syllabus_file[0];
      const disallowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/mpeg",
        "video/avi",
        "video/quicktime",
      ];
      if (disallowedMimeTypes.includes(syllabusFile.mimetype)) {
        return res.status(400).json({
          message: "Invalid file type for syllabus file. No images or videos allowed.",
        });
      }
      course_syllabus_file = `/uploads/course/${syllabusFile.filename}`;
    }

    let course_questions_file = null;
    if (req.files?.course_questions_file) {
      const questionsFile = req.files.course_questions_file[0];
      const disallowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/mpeg",
        "video/avi",
        "video/quicktime",
      ];
      if (disallowedMimeTypes.includes(questionsFile.mimetype)) {
        return res.status(400).json({
          message: "Invalid file type for questions file. No images or videos allowed.",
        });
      }
      course_questions_file = `/uploads/course/${questionsFile.filename}`;
    }

    const newCourse = await Course.create({
      course_name,
      course_description,
      course_rating: course_rating || 0,
      course_category_id,
      course_duration,
      course_fee,
      course_overview,
      course_syllabus,
      course_study_material,
      course_image,
      course_syllabus_file,
      course_questions_file,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    await CourseCategory.increment(
      { total_courses: 1 },
      { where: { category_id: course_category_id } }
    );

    res.status(201).json({
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (err) {
    console.error("Error in createCourse:", err);
    res.status(500).json({ error: err.message });
  }
};

// list
export const getCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", category_id, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where.course_name = { [Op.like]: `%${search}%` };
    }

    if (category_id) {
      where.course_category_id = category_id;
    }

    if (status !== undefined && (status === "0" || status === "1")) {
      where.status = Number(status);
    }

    const { rows, count } = await Course.findAndCountAll({
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
      order: [["course_id", "DESC"]],
    });

    res.json({
      message: "Courses fetched successfully",
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    console.error("Error in getCourses:", err);
    res.status(500).json({ error: err.message });
  }
};

// single
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id, {
      include: [
        {
          model: CourseCategory,
          as: "category",
          attributes: ["category_id", "category_name"],
        },
      ],
    });

    if (!course) return res.status(404).json({ message: "Course not found" });

    res.json({
      message: "Course found successfully",
      data: course,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update 
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      course_name,
      course_description,
      course_rating,
      course_category_id,
      course_duration,
      course_fee,
      course_overview,
      course_syllabus,
      course_study_material,
      status,
    } = req.body;

    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const duplicate = await Course.findOne({
      where: {
        [Op.and]: [{ course_id: { [Op.ne]: id } }, { course_name }],
      },
    });
    if (duplicate)
      return res.status(400).json({ message: "Course name already exists" });

    if (course_category_id) {
      const exists = await CourseCategory.findByPk(course_category_id);
      if (!exists) return res.status(400).json({ message: "Invalid category" });
    }

    let newImage = null;
    let newSyllabusFile = null;
    let newQuestionsFile = null;

    if (req.files?.course_image) {
      const imageFile = req.files.course_image[0];
      const allowedImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];

      if (!allowedImageTypes.includes(imageFile.mimetype)) {
        return res
          .status(400)
          .json({
            message:
              "Invalid course_image file type. Only JPG, PNG, GIF, and WEBP are allowed.",
          });
      }

      newImage = `/uploads/course/${imageFile.filename}`;
    }

    if (req.files?.course_syllabus_file) {
      const syllabusFile = req.files.course_syllabus_file[0];
      const disallowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/mpeg",
        "video/avi",
        "video/quicktime",
      ];

      if (disallowedMimeTypes.includes(syllabusFile.mimetype)) {
        return res.status(400).json({
          message:
            "Invalid course_syllabus_file type. Images and videos are not allowed.",
        });
      }

      newSyllabusFile = `/uploads/course/${syllabusFile.filename}`;
    }

    if (req.files?.course_questions_file) {
      const questionsFile = req.files.course_questions_file[0];
      const disallowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/mpeg",
        "video/avi",
        "video/quicktime",
      ];

      if (disallowedMimeTypes.includes(questionsFile.mimetype)) {
        return res.status(400).json({
          message:
            "Invalid course_questions_file type. Images and videos are not allowed.",
        });
      }

      newQuestionsFile = `/uploads/course/${questionsFile.filename}`;
    }

    if (newImage && course.course_image) deleteFile(course.course_image);
    if (newSyllabusFile && course.course_syllabus_file)
      deleteFile(course.course_syllabus_file);
    if (newQuestionsFile && course.course_questions_file)
      deleteFile(course.course_questions_file);

    course.course_name = course_name || course.course_name;
    course.course_description = course_description || course.course_description;
    course.course_rating =
      course_rating && course_rating <= 5 ? course_rating : course.course_rating;
    course.course_category_id = course_category_id || course.course_category_id;
    course.course_duration = course_duration || course.course_duration;
    course.course_fee = course_fee || course.course_fee;
    course.course_overview = course_overview || course.course_overview;
    course.course_syllabus = course_syllabus || course.course_syllabus;
    course.course_study_material =
      course_study_material || course.course_study_material;
    course.status = [0, 1].includes(Number(status))
      ? Number(status)
      : course.status;
    course.updated_by = req.user?.user_id || 0;
    course.updated_at = new Date();

    if (newImage) course.course_image = newImage;
    if (newSyllabusFile) course.course_syllabus_file = newSyllabusFile;
    if (newQuestionsFile) course.course_questions_file = newQuestionsFile;

    await course.save();

    res.json({
      message: "Course updated successfully",
      data: course,
    });
  } catch (err) {
    console.error("Error in updateCourse:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const categoryId = course.course_category_id;

    deleteFile(course.course_image);
    deleteFile(course.course_syllabus_file);
    deleteFile(course.course_questions_file);

    await course.destroy();

    const category = await CourseCategory.findByPk(categoryId);
    if (category) {
      const newCount = Math.max((category.total_courses || 0) - 1, 0);
      await category.update({ total_courses: newCount });
    }

    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error("Error in deleteCourse:", err);
    res.status(500).json({ error: err.message });
  }
};
