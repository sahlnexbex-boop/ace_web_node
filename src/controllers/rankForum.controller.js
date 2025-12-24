import RankForum from "../models/rankForum.model.js";
import CourseCategory from "../models/courseCategory.model.js";
import { Op } from "sequelize";
import { deleteFile } from "../utils/fileHelper.js";

const isUnsupportedFile = (mimetype) => !mimetype.startsWith("image/");
const isValidRequestStatus = (val) => [1, 2, 3].includes(Number(val));

/* ================= CREATE ================= */
export const createRankForum = async (req, res) => {
  try {
    const {
      name,
      mobile_no,
      email,
      rank,
      department_id,
      name_of_office,
      post,
      district,
      joining_date,
      request_status,
      status,
    } = req.body;

    if (!department_id) {
      return res.status(400).json({ message: "department_id is required" });
    }

    const departmentExists = await CourseCategory.findByPk(department_id);
    if (!departmentExists) {
      return res.status(400).json({ message: "Invalid department_id" });
    }

    const photo = req.file ? `/uploads/rankforum/${req.file.filename}` : null;
    const reqStatus = isValidRequestStatus(request_status)
      ? Number(request_status)
      : 1;

    if (req.file && isUnsupportedFile(req.file.mimetype)) {
      return res
        .status(400)
        .json({ message: "Invalid file type. Images only allowed" });
    }

    const rankForum = await RankForum.create({
      name,
      mobile_no,
      email,
      rank,
      department_id,
      name_of_office,
      post,
      district,
      joining_date,
      request_status: reqStatus || 1,
      photo,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({
      message: "RankForum created successfully",
      data: rankForum,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= LIST ================= */
export const getRankForums = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      department_id,
      request_status, 
    } = req.query;

    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    if (status && [0, 1].includes(Number(status))) {
      where.status = Number(status);
    }

    if (department_id) {
      where.department_id = Number(department_id);
    }

    //  request_status filter (ONLY 1,2,3)
    if ([1, 2, 3].includes(Number(request_status))) {
      where.request_status = Number(request_status);
    }

    const { rows, count } = await RankForum.findAndCountAll({
      where,
      include: [
        {
          model: CourseCategory,
          as: "department",
          attributes: ["category_id", "category_name"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["rankforum_id", "DESC"]],
    });

    res.json({
      message: "RankForums fetched successfully",
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= SINGLE ================= */
export const getRankForumById = async (req, res) => {
  try {
    const forum = await RankForum.findByPk(req.params.id, {
      include: [
        {
          model: CourseCategory,
          as: "department",
          attributes: ["category_id", "category_name"],
        },
      ],
    });

    if (!forum) {
      return res.status(404).json({ message: "RankForum not found" });
    }

    res.json({ message: "RankForum fetched successfully", data: forum });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= UPDATE ================= */
export const updateRankForum = async (req, res) => {
  try {
    const forum = await RankForum.findByPk(req.params.id);
    if (!forum) return res.status(404).json({ message: "RankForum not found" });

    const {
      name,
      mobile_no,
      email,
      rank,
      department_id,
      name_of_office,
      post,
      district,
      joining_date,
      request_status,
      status,
    } = req.body;

    if (department_id) {
      const departmentExists = await CourseCategory.findByPk(department_id);
      if (!departmentExists)
        return res.status(400).json({ message: "Invalid department_id" });
      forum.department_id = department_id;
    }

    const newPhoto = req.file
      ? `/uploads/rankforum/${req.file.filename}`
      : null;

    if (newPhoto && isUnsupportedFile(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid image file" });
    }

    if (newPhoto && forum.photo) deleteFile(forum.photo);

    let reqStatus = 1;

    if (request_status) {
       reqStatus = isValidRequestStatus(request_status)
        ? Number(request_status)
        : 1;
    }

    Object.assign(forum, {
      name: name ?? forum.name,
      mobile_no: mobile_no ?? forum.mobile_no,
      email: email ?? forum.email,
      rank: rank ?? forum.rank,
      name_of_office: name_of_office ?? forum.name_of_office,
      post: post ?? forum.post,
      district: district ?? forum.district,
      request_status: reqStatus,
      joining_date: joining_date ?? forum.joining_date,
      status: [0, 1].includes(Number(status)) ? Number(status) : forum.status,
      photo: newPhoto ?? forum.photo,
      updated_by: req.user?.user_id || 0,
    });

    await forum.save();
    res.json({ message: "RankForum updated successfully", data: forum });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= DELETE ================= */
export const deleteRankForum = async (req, res) => {
  try {
    const forum = await RankForum.findByPk(req.params.id);
    if (!forum) return res.status(404).json({ message: "RankForum not found" });

    if (forum.photo) deleteFile(forum.photo);
    await forum.destroy();

    res.json({ message: "RankForum deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
