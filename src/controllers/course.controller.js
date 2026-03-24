import { Op } from "sequelize";
import Course from "../models/course.model.js";
import Module from "../models/module.model.js";
import Chapter from "../models/chapter.model.js";
import CourseCategory from "../models/courseCategory.model.js";
import sequelize from "../config/db.js";
import { deleteFile } from "../utils/fileHelper.js";
import { slugify, deslugify } from "../utils/slugify.js";

// Helpers
const extractYoutubeId = (url) => {
  if (!url) return null;
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : url;
};

const normalizeCourseType = (value) => {
  if (value === undefined || value === null || value === "") return null;

  let asArray;

  if (Array.isArray(value)) {
    asArray = value;
  } else if (typeof value === "string") {
    const trimmed = value.trim();
    // Try JSON first: "[1,2]"
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        asArray = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // Fallback to comma separated
        asArray = trimmed.split(",");
      }
    } else {
      // "1" or "1,2"
      asArray = trimmed.split(",");
    }
  } else {
    asArray = [value];
  }

  // Normalize to numbers and dedupe
  const normalized = [...new Set(
    asArray
      .map((v) => Number(v))
      .filter((v) => !Number.isNaN(v))
  )];

  if (!normalized.length) return null;

  return normalized;
};

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
      cour_type,
      course_type,
      status,
    } = req.body;

    if (!course_name || !course_category_id) {
      return res
        .status(400)
        .json({ message: "course_name and course_category_id are required" });
    }

    const existing = await Course.findOne({ where: { course_name } });
    if (existing) {
      return res.status(400).json({ message: "Course name already exists" });
    }

    const category = await CourseCategory.findByPk(course_category_id);
    if (!category) {
      return res.status(400).json({ message: "Invalid course_category_id" });
    }

    // rating validation
    let normalizedRating = Number(course_rating || 0);
    if (Number.isNaN(normalizedRating) || normalizedRating < 0) {
      normalizedRating = 0;
    }
    if (normalizedRating > 5) {
      return res.status(400).json({ message: "Max rating is 5" });
    }

    // cour_type / course_type handling (accept [1] or [1,2] etc.)
    const rawCourseType = cour_type ?? course_type;
    const courseType = normalizeCourseType(rawCourseType);
    if (!courseType) {
      return res
        .status(400)
        .json({ message: "Invalid cour_type. Expected [1] or [1,2]." });
    }

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
      course_rating: normalizedRating,
      course_category_id,
      course_duration,
      course_fee,
      course_overview,
      course_syllabus,
      course_study_material,
      course_image,
      course_syllabus_file,
      course_questions_file,
      course_type: courseType, // stored as JSON array in DB
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });



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

// single get by id
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const { modules, chapters } = req.query;

    const include = [
      {
        model: CourseCategory,
        as: "category",
        attributes: ["category_id", "category_name"],
      },
    ];

    if (modules === "true") {
      const moduleInclude = {
        model: Module,
        as: "modules",
      };

      if (chapters === "true") {
        moduleInclude.include = [{ model: Chapter, as: "chapters" }];
      }

      include.push(moduleInclude);
    }

    const course = await Course.findByPk(id, {
      include,
      order: [
        [{ model: Module, as: "modules" }, "module_id", "ASC"],
        [{ model: Module, as: "modules" }, { model: Chapter, as: "chapters" }, "chapter_id", "ASC"],
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

// single get by slug
export const getCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { modules, chapters } = req.query;

    if (!slug) {
      return res.status(400).json({ message: "Slug is required" });
    }

    const include = [
      {
        model: CourseCategory,
        as: "category",
        attributes: ["category_id", "category_name"],
      },
    ];

    if (modules === "true") {
      const moduleInclude = {
        model: Module,
        as: "modules",
      };

      if (chapters === "true") {
        moduleInclude.include = [{ model: Chapter, as: "chapters" }];
      }

      include.push(moduleInclude);
    }

    // To correctly handle special characters, we fetch active courses and find the match by slugifying their names.
    const allCourses = await Course.findAll({
      where: { status: 1 },
      include,
      order: [
        [{ model: Module, as: "modules" }, "module_id", "ASC"],
        [{ model: Module, as: "modules" }, { model: Chapter, as: "chapters" }, "chapter_id", "ASC"],
      ],
    });

    const course = allCourses.find((c) => slugify(c.course_name) === slug);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({
      message: "Course fetched successfully",
      data: course,
    });
  } catch (err) {
    console.error("getCourseBySlug error:", err);
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
      cour_type,   // optional; legacy name
      course_type, // optional; what frontend is actually sending
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

    // rating validation
    if (course_rating !== undefined) {
      let updatedRating = Number(course_rating);
      if (Number.isNaN(updatedRating) || updatedRating < 0) {
        updatedRating = course.course_rating;
      } else if (updatedRating > 5) {
        return res.status(400).json({ message: "Max rating is 5" });
      }
      course.course_rating = updatedRating;
    }

    // cour_type / course_type handling on update
    const rawCourseType = cour_type ?? course_type;
    if (rawCourseType !== undefined) {
      const courseType = normalizeCourseType(rawCourseType);
      if (!courseType) {
        return res
          .status(400)
          .json({ message: "Invalid cour_type. Expected [1] or [1,2]." });
      }
      course.course_type = courseType;
    }
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
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id, { transaction });
    if (!course) {
      await transaction.rollback();
      return res.status(404).json({ message: "Course not found" });
    }

    // Find modules to handle cleanup
    const modules = await Module.findAll({
      where: { course_id: id },
      attributes: ["module_id"],
      transaction
    });

    const moduleIds = modules.map((m) => m.module_id);

    if (moduleIds.length > 0) {
      // Delete all chapters belonging to these modules
      await Chapter.destroy({
        where: { module_id: moduleIds },
        transaction
      });

      // Delete the modules themselves
      await Module.destroy({
        where: { course_id: id },
        transaction
      });
    }

    // Delete physical files
    if (course.course_image) deleteFile(course.course_image);
    if (course.course_syllabus_file) deleteFile(course.course_syllabus_file);
    if (course.course_questions_file) deleteFile(course.course_questions_file);

    // Final course deletion
    await course.destroy({ transaction });

    await transaction.commit();

    res.json({
      message: "Course along with its modules and chapters deleted successfully",
    });
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error("Error in deleteCourse:", err);
    res.status(500).json({ error: err.message });
  }
};

// Create Course with Modules and Chapters
export const createFullCourse = async (req, res) => {
  const transaction = await sequelize.transaction();
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
      cour_type,
      course_type,
      status,
      modules
    } = req.body;

    // Handle stringified modules
    let modulesList = modules;
    if (typeof modules === "string") {
      try {
        modulesList = JSON.parse(modules);
      } catch (e) {
        if (transaction) await transaction.rollback();
        return res.status(400).json({
          message: "Invalid JSON format in 'modules' field",
          error: e.message
        });
      }
    }

    if (!course_name || !course_category_id) {
      if (transaction) await transaction.rollback();
      return res.status(400).json({ message: "course_name and course_category_id are required" });
    }

    const existing = await Course.findOne({ where: { course_name } });
    if (existing) {
      if (transaction) await transaction.rollback();
      return res.status(400).json({ message: "Course name already exists" });
    }

    const category = await CourseCategory.findByPk(course_category_id);
    if (!category) {
      if (transaction) await transaction.rollback();
      return res.status(400).json({ message: "Invalid course_category_id" });
    }

    let normalizedRating = Number(course_rating || 0);
    if (Number.isNaN(normalizedRating) || normalizedRating < 0) normalizedRating = 0;
    if (normalizedRating > 5) {
      if (transaction) await transaction.rollback();
      return res.status(400).json({ message: "Max rating is 5" });
    }

    const rawCourseType = cour_type ?? course_type;
    const courseTypeNormal = normalizeCourseType(rawCourseType);
    if (!courseTypeNormal) {
      if (transaction) await transaction.rollback();
      return res.status(400).json({ message: "Invalid course_type. Expected [1] or [1,2]." });
    }

    let course_image = null;
    let course_syllabus_file = null;
    let course_questions_file = null;

    if (req.files) {
      if (req.files.course_image) {
        course_image = `/uploads/course/${req.files.course_image[0].filename}`;
      }
      if (req.files.course_syllabus_file) {
        course_syllabus_file = `/uploads/course/${req.files.course_syllabus_file[0].filename}`;
      }
      if (req.files.course_questions_file) {
        course_questions_file = `/uploads/course/${req.files.course_questions_file[0].filename}`;
      }
    }

    const newCourse = await Course.create({
      course_name,
      course_description,
      course_rating: normalizedRating,
      course_category_id,
      course_duration,
      course_fee,
      course_overview,
      course_syllabus,
      course_study_material,
      course_image,
      course_syllabus_file,
      course_questions_file,
      course_type: courseTypeNormal,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    }, { transaction });

    if (modulesList && Array.isArray(modulesList)) {
      for (const mod of modulesList) {
        const newModule = await Module.create({
          module_name: mod.module_name,
          course_id: newCourse.course_id,
          status: mod.status !== undefined ? Number(mod.status) : 1,
          created_by: req.user?.user_id || 0,
        }, { transaction });

        if (mod.chapters && Array.isArray(mod.chapters)) {
          console.log(`Creating ${mod.chapters.length} chapters for module ${newModule.module_id}`);
          const chaptersData = mod.chapters.map(chap => ({
            chapter_name: chap.chapter_name,
            module_id: newModule.module_id,
            is_preview: Number(chap.is_preview) || 0,
            preview_url: extractYoutubeId(chap.preview_url),
            status: chap.status !== undefined ? Number(chap.status) : 1,
            created_by: req.user?.user_id || 0,
          }));
          await Chapter.bulkCreate(chaptersData, { transaction });
        }
      }
    } else {
      console.log("No modules to create or modulesList is not an array");
    }

    await transaction.commit();
    console.log("Transaction committed successfully");

    // Fetch the complete data after commit
    const fullData = await Course.findByPk(newCourse.course_id, {
      include: [
        {
          model: CourseCategory,
          as: "category",
          attributes: ["category_id", "category_name"],
        },
        {
          model: Module,
          as: "modules",
          include: [{ model: Chapter, as: "chapters" }],
        },
      ],
      order: [
        [{ model: Module, as: "modules" }, "module_id", "ASC"],
        [{ model: Module, as: "modules" }, { model: Chapter, as: "chapters" }, "chapter_id", "ASC"],
      ],
    });

    res.status(201).json({
      message: "Course with modules and chapters created successfully",
      data: fullData,
    });
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error("Error in createFullCourse:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update Course with Modules and Chapters
export const updateFullCourse = async (req, res) => {
  const transaction = await sequelize.transaction();
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
      cour_type,
      course_type,
      status,
      modules // Expected to be a JSON string or array
    } = req.body;

    // Handle stringified modules (common in multipart-form-data)
    let modulesList = modules;
    if (typeof modules === "string" && modules.trim() !== "") {
      try {
        modulesList = JSON.parse(modules);
      } catch (e) {
        console.error("Error parsing modules JSON string:", e.message);
        if (transaction) await transaction.rollback();
        return res.status(400).json({
          message: "Invalid JSON format in 'modules' field",
          error: e.message
        });
      }
    }

    const course = await Course.findByPk(id, { transaction });
    if (!course) {
      await transaction.rollback();
      return res.status(404).json({ message: "Course not found" });
    }

    // Check duplicate name
    if (course_name && course_name !== course.course_name) {
      const duplicate = await Course.findOne({
        where: {
          [Op.and]: [{ course_id: { [Op.ne]: id } }, { course_name }],
        },
        transaction
      });
      if (duplicate) {
        await transaction.rollback();
        return res.status(400).json({ message: "Course name already exists" });
      }
    }

    if (course_category_id) {
      const category = await CourseCategory.findByPk(course_category_id, { transaction });
      if (!category) {
        await transaction.rollback();
        return res.status(400).json({ message: "Invalid course_category_id" });
      }
    }

    // Update Course Fields
    course.course_name = course_name || course.course_name;
    course.course_description = course_description || course.course_description;

    if (course_rating !== undefined) {
      let updatedRating = Number(course_rating);
      if (!Number.isNaN(updatedRating) && updatedRating >= 0 && updatedRating <= 5) {
        course.course_rating = updatedRating;
      }
    }

    const rawCourseType = cour_type ?? course_type;
    if (rawCourseType !== undefined) {
      const normalized = normalizeCourseType(rawCourseType);
      if (normalized) course.course_type = normalized;
    }

    course.course_category_id = course_category_id || course.course_category_id;
    course.course_duration = course_duration || course.course_duration;
    course.course_fee = course_fee || course.course_fee;
    course.course_overview = course_overview || course.course_overview;
    course.course_syllabus = course_syllabus || course.course_syllabus;
    course.course_study_material = course_study_material || course.course_study_material;

    if (status !== undefined) {
      course.status = [0, 1].includes(Number(status)) ? Number(status) : course.status;
    }

    // Process Files
    if (req.files) {
      if (req.files.course_image) {
        if (course.course_image) deleteFile(course.course_image);
        course.course_image = `/uploads/course/${req.files.course_image[0].filename}`;
      }
      if (req.files.course_syllabus_file) {
        if (course.course_syllabus_file) deleteFile(course.course_syllabus_file);
        course.course_syllabus_file = `/uploads/course/${req.files.course_syllabus_file[0].filename}`;
      }
      if (req.files.course_questions_file) {
        if (course.course_questions_file) deleteFile(course.course_questions_file);
        course.course_questions_file = `/uploads/course/${req.files.course_questions_file[0].filename}`;
      }
    }

    course.updated_by = req.user?.user_id || 0;
    course.updated_at = new Date();

    await course.save({ transaction });

    // --- Sync Modules and Chapters ---
    const seenModuleIds = [];

    if (modulesList && Array.isArray(modulesList)) {
      for (const mod of modulesList) {
        let moduleInstance;

        if (mod.module_id) {
          // Update existing module
          moduleInstance = await Module.findByPk(mod.module_id, { transaction });
          if (moduleInstance && Number(moduleInstance.course_id) === Number(id)) {
            moduleInstance.module_name = mod.module_name || moduleInstance.module_name;
            moduleInstance.status = mod.status !== undefined ? Number(mod.status) : moduleInstance.status;
            moduleInstance.updated_at = new Date();
            moduleInstance.updated_by = req.user?.user_id || 0;
            await moduleInstance.save({ transaction });
            seenModuleIds.push(moduleInstance.module_id);
          }
        } else if (mod.module_name) {
          // Create new module
          moduleInstance = await Module.create({
            module_name: mod.module_name,
            course_id: id,
            status: mod.status !== undefined ? Number(mod.status) : 1,
            created_by: req.user?.user_id || 0,
          }, { transaction });
          seenModuleIds.push(moduleInstance.module_id);
        }

        if (moduleInstance) {
          const seenChapterIds = [];
          if (mod.chapters && Array.isArray(mod.chapters)) {
            for (const chap of mod.chapters) {
              if (chap.chapter_id) {
                // Update existing chapter
                const chapterInstance = await Chapter.findByPk(chap.chapter_id, { transaction });
                if (chapterInstance && Number(chapterInstance.module_id) === Number(moduleInstance.module_id)) {
                  chapterInstance.chapter_name = chap.chapter_name || chapterInstance.chapter_name;
                  chapterInstance.is_preview = chap.is_preview !== undefined ? Number(chap.is_preview) : chapterInstance.is_preview;
                  chapterInstance.preview_url = extractYoutubeId(chap.preview_url);
                  chapterInstance.status = chap.status !== undefined ? Number(chap.status) : chapterInstance.status;
                  chapterInstance.updated_at = new Date();
                  chapterInstance.updated_by = req.user?.user_id || 0;
                  await chapterInstance.save({ transaction });
                  seenChapterIds.push(chapterInstance.chapter_id);
                }
              } else if (chap.chapter_name) {
                // Create new chapter
                const newChapter = await Chapter.create({
                  chapter_name: chap.chapter_name,
                  module_id: moduleInstance.module_id,
                  is_preview: Number(chap.is_preview) || 0,
                  preview_url: extractYoutubeId(chap.preview_url),
                  status: chap.status !== undefined ? Number(chap.status) : 1,
                  created_by: req.user?.user_id || 0,
                }, { transaction });
                seenChapterIds.push(newChapter.chapter_id);
              }
            }
          }
          // Delete chapters belonging to this module that are NOT in the submitted list
          await Chapter.destroy({
            where: {
              module_id: moduleInstance.module_id,
              chapter_id: { [Op.notIn]: seenChapterIds }
            },
            transaction
          });
        }
      }
    }

    // Delete modules belonging to this course that are NOT in the submitted list
    await Module.destroy({
      where: {
        course_id: id,
        module_id: { [Op.notIn]: seenModuleIds }
      },
      transaction
    });

    await transaction.commit();

    // Fetch refreshed data
    const fullData = await Course.findByPk(id, {
      include: [
        {
          model: CourseCategory,
          as: "category",
          attributes: ["category_id", "category_name"],
        },
        {
          model: Module,
          as: "modules",
          include: [{ model: Chapter, as: "chapters" }],
        },
      ],
      order: [
        [{ model: Module, as: "modules" }, "module_id", "ASC"],
        [{ model: Module, as: "modules" }, { model: Chapter, as: "chapters" }, "chapter_id", "ASC"],
      ],
    });

    res.json({
      message: "Course, modules, and chapters updated successfully",
      data: fullData,
    });
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error("Error in updateFullCourse:", err);
    res.status(500).json({ error: err.message });
  }
};
