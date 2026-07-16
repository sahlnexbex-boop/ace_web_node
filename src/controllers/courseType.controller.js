import { Op } from "sequelize";
import CourseType from "../models/courseType.model.js";

// create
export const createCourseType = async (req, res) => {
  try {
    const { type_name, status = 1, V2_category } = req.body;

    if (!type_name) {
      return res.status(400).json({ message: "Type name is required" });
    }

    const exists = await CourseType.findOne({ where: { type_name } });
    if (exists) {
      return res.status(400).json({ message: "Course type already exists" });
    }

    const courseType = await CourseType.create({
      type_name,
      status: [0, 1].includes(Number(status)) ? status : 1,
      V2_category: V2_category !== undefined ? V2_category : null,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({
      message: "Course type created successfully",
      data: courseType,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// list all
export const getCourseTypes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where.type_name = { [Op.like]: `%${search}%` };
    }

    if (status !== undefined && (status === "0" || status === "1")) {
      where.status = Number(status);
    }

    const { rows, count } = await CourseType.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["type_id", "DESC"]],
    });

    // Fetch V2 categories
    let v2Categories = [];
    try {
      const v2Url = process.env.NEXT_PUBLIC_ACEAPP_V2_URL || "http://localhost:8080";
      const v2Res = await fetch(`${v2Url}/course_mang/categories/`);
      if (v2Res.ok) {
        v2Categories = await v2Res.json();
      }
    } catch (err) {
      console.error("Error fetching V2 categories in getCourseTypes:", err.message);
    }

    // Map V2 category name to rows
    const mappedData = rows.map((row) => {
      const dataPlain = row.get({ plain: true });
      const matched = v2Categories.find(
        (c) => String(c.id) === String(dataPlain.V2_category)
      );
      dataPlain.V2_category_name = matched ? matched.name : null;
      return dataPlain;
    });

    res.json({
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data: mappedData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get single
export const getCourseTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const courseType = await CourseType.findByPk(id);

    if (!courseType) {
      return res.status(404).json({ message: "Course type not found" });
    }

    let V2_category_name = null;
    if (courseType.V2_category) {
      try {
        const v2Url = process.env.NEXT_PUBLIC_ACEAPP_V2_URL || "http://localhost:8080";
        const v2Res = await fetch(`${v2Url}/course_mang/categories/`);
        if (v2Res.ok) {
          const v2Categories = await v2Res.json();
          const matched = v2Categories.find(
            (c) => String(c.id) === String(courseType.V2_category)
          );
          if (matched) V2_category_name = matched.name;
        }
      } catch (err) {
        console.error("Error fetching V2 category by ID in backend:", err.message);
      }
    }

    const dataPlain = courseType.get({ plain: true });
    dataPlain.V2_category_name = V2_category_name;

    res.json({
      message: "Course type found successfully",
      data: dataPlain,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update
export const updateCourseType = async (req, res) => {
  try {
    const { id } = req.params;
    const { type_name, status, V2_category } = req.body;

    const courseType = await CourseType.findByPk(id);
    if (!courseType) {
      return res.status(404).json({ message: "Course type not found" });
    }

    const duplicate = await CourseType.findOne({
      where: {
        [Op.and]: [
          { type_id: { [Op.ne]: id } },
          { type_name },
        ],
      },
    });
    if (duplicate) {
      return res.status(400).json({ message: "Type name already exists" });
    }

    if (type_name) courseType.type_name = type_name;
    if (status !== undefined)
      courseType.status = [0, 1].includes(Number(status))
        ? status
        : courseType.status;
    if (V2_category !== undefined) courseType.V2_category = V2_category;

    courseType.updated_by = req.user?.user_id || 0;
    courseType.updated_at = new Date();

    await courseType.save();

    res.json({
      message: "Course type updated successfully",
      data: courseType,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// delete
export const deleteCourseType = async (req, res) => {
  try {
    const { id } = req.params;
    const courseType = await CourseType.findByPk(id);

    if (!courseType) {
      return res.status(404).json({ message: "Course type not found" });
    }

    await courseType.destroy();
    res.json({ message: "Course type deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
