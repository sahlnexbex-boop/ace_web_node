import { Op } from "sequelize";
import CourseType from "../models/courseType.model.js";

// create
export const createCourseType = async (req, res) => {
  try {
    const { type_name, status = 1 } = req.body;

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
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where.type_name = { [Op.like]: `%${search}%` };
    }

    const { rows, count } = await CourseType.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["type_id", "DESC"]],
    });

    res.json({
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
export const getCourseTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const courseType = await CourseType.findByPk(id);

    if (!courseType) {
      return res.status(404).json({ message: "Course type not found" });
    }

    res.json({
      message: "Course type found successfully",
      data: courseType,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update
export const updateCourseType = async (req, res) => {
  try {
    const { id } = req.params;
    const { type_name, status } = req.body;

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
