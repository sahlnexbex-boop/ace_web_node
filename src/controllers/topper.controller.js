import Topper from "../models/topper.model.js";
// import Course from "../models/course.model.js";
import CourseCategory from "../models/courseCategory.model.js";
import { Op } from "sequelize";
import sequelize from "../config/db.js";
import { deleteFile } from "../utils/fileHelper.js";

const isUnsupportedFile = (mimetype) => {
  return !mimetype.startsWith("image/");
};

// create
export const createTopper = async (req, res) => {
  try {
    const { topper_name, topper_rank, year, exam_name, category_id, status } = req.body;

    const topper_image = req.file
      ? `/uploads/toppers/${req.file.filename}`
      : null;

    if (req.file && isUnsupportedFile(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Only images allowed." });
    }

    // required fields
    if (!topper_name || !topper_rank || !year || !exam_name || !category_id)
      return res.status(400).json({ message: "Missing required fields" });

    // validate category
    const categoryExists = await CourseCategory.findByPk(category_id);
    if (!categoryExists) return res.status(400).json({ message: "Invalid category_id" });

    const topper = await Topper.create({
      topper_name,
      topper_rank,
      year,
      exam_name,
      category_id,
      topper_image,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({ message: "Topper created successfully", data: topper });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// list
export const getToppers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status, category_id, year, year_based } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) where.topper_name = { [Op.like]: `%${search}%` };
    if (status && [0, 1].includes(Number(status))) where.status = Number(status);
    if (category_id) where.category_id = category_id;
    if (year) where.year = year;

    const order = [];
    if (year_based === "true") {
      order.push(["year", "DESC"]);
    }
    order.push(["topper_id", "DESC"]);

    const { rows, count } = await Topper.findAndCountAll({
      where,
      include: [
        { model: CourseCategory, as: "category", attributes: ["category_id", "category_name"] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order,
    });

    res.json({
      message: "Toppers fetched successfully",
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get category list having toppers only
export const getTopperCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const where = { status: 1 };
    if (search) {
      where.category_name = { [Op.like]: `%${search}%` };
    }

    const { rows, count } = await CourseCategory.findAndCountAll({
      where,
      attributes: [
        "category_id",
        "category_name",
        "category_image",
        [sequelize.fn("COUNT", sequelize.col("toppers.topper_id")), "topper_count"],
      ],
      include: [
        {
          model: Topper,
          as: "toppers",
          attributes: [],
          where: { status: 1 },
          required: true, // Only categories with toppers
        },
      ],
      group: [
        "CourseCategory.category_id",
        "CourseCategory.category_name",
        "CourseCategory.category_image",
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      subQuery: false,
      distinct: true,
    });

    const totalCount = count.length;

    // Fetch first topper data for each category
    const rowsWithTopper = await Promise.all(
      rows.map(async (cat) => {
        const firstTopper = await Topper.findOne({
          where: { category_id: cat.category_id, status: 1 },
          order: [["topper_id", "DESC"]],
          attributes: ["topper_id", "topper_name", "topper_image", "topper_rank", "year", "exam_name"],
        });

        return {
          ...cat.toJSON(),
          first_topper: firstTopper || null,
        };
      })
    );

    res.json({
      message: "Topper categories fetched successfully",
      total: totalCount,
      page: Number(page),
      totalPages: Math.ceil(totalCount / limit),
      data: rowsWithTopper,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Single
export const getTopperById = async (req, res) => {
  try {
    const { id } = req.params;

    const topper = await Topper.findByPk(id, {
      include: [
        {
          model: CourseCategory,
          as: "category",
          attributes: ["category_id", "category_name"],
        },
      ],
    });

    if (!topper)
      return res.status(404).json({ message: "Topper not found" });

    res.json({
      message: "Topper fetched successfully",
      data: topper,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
export const updateTopper = async (req, res) => {
  try {
    const { id } = req.params;
    const { topper_name, topper_rank, year, exam_name, category_id, status } = req.body;

    const newImage = req.file
      ? `/uploads/toppers/${req.file.filename}`
      : null;

    if (req.file && isUnsupportedFile(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Only images allowed." });
    }

    const topper = await Topper.findByPk(id);
    if (!topper) return res.status(404).json({ message: "Topper not found" });

    if (category_id) {
      const categoryExists = await CourseCategory.findByPk(category_id);
      if (!categoryExists) return res.status(400).json({ message: "Invalid category_id" });
    }

    // delete old image
    if (newImage && topper.topper_image) deleteFile(topper.topper_image);

    topper.topper_name = topper_name || topper.topper_name;
    topper.topper_rank = topper_rank || topper.topper_rank;
    topper.year = year || topper.year;
    topper.exam_name = exam_name || topper.exam_name;
    topper.category_id = category_id || topper.category_id;
    topper.status = [0, 1].includes(Number(status)) ? Number(status) : topper.status;
    topper.topper_image = newImage || topper.topper_image;
    topper.updated_by = req.user?.user_id || 0;

    await topper.save();

    res.json({ message: "Topper updated successfully", data: topper });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Delete
export const deleteTopper = async (req, res) => {
  try {
    const { id } = req.params;
    const topper = await Topper.findByPk(id);
    if (!topper) return res.status(404).json({ message: "Topper not found" });

    if (topper.topper_image) deleteFile(topper.topper_image);

    await topper.destroy();
    res.json({ message: "Topper deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
