import RankForum from "../models/rankForum.model.js";
import { Op } from "sequelize";

// helpers
const normalizeTinyInt = (val, defaultVal = 1) => {
  if (val === undefined || val === null || val === "") return defaultVal;
  const n = Number(val);
  return n === 0 || n === 1 ? n : defaultVal;
};

const normalizeRequestStatus = (val) => {
  const n = Number(val);
  return [1, 2, 3].includes(n) ? n : 1;
};

//  CREATE 
export const createRankForum = async (req, res) => {
  try {
    const {
      name,
      mobile_no,
      email,
      course,
      batch,
      year_of_study,
      reg_no,
      name_of_office,
      post,
      joining_date,
      office_address,
      request_status,
      status,
    } = req.body;

    // Required fields validation
    if (
      !name ||
      !mobile_no ||
      !email ||
      !course ||
      !year_of_study ||
      !reg_no ||
      !name_of_office ||
      !post ||
      !joining_date
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const forum = await RankForum.create({
      name,
      mobile_no,
      email,
      course,
      batch,
      year_of_study,
      reg_no,
      name_of_office,
      post,
      joining_date,
      office_address,
      request_status: normalizeRequestStatus(request_status),
      status: normalizeTinyInt(status, 1),
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({
      message: "RankForum created successfully",
      data: forum,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  LIST 
export const getRankForums = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      request_status,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { mobile_no: { [Op.like]: `%${search}%` } },
        { reg_no: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status !== undefined) {
      where.status = normalizeTinyInt(status, undefined);
    }

    if ([1, 2, 3].includes(Number(request_status))) {
      where.request_status = Number(request_status);
    }

    const { rows, count } = await RankForum.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
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

//  SINGLE 
export const getRankForumById = async (req, res) => {
  try {
    const forum = await RankForum.findByPk(req.params.id);

    if (!forum) {
      return res.status(404).json({ message: "RankForum not found" });
    }

    res.json({
      message: "RankForum fetched successfully",
      data: forum,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  UPDATE 
export const updateRankForum = async (req, res) => {
  try {
    const forum = await RankForum.findByPk(req.params.id);
    if (!forum) {
      return res.status(404).json({ message: "RankForum not found" });
    }

    const {
      name,
      mobile_no,
      email,
      course,
      batch,
      year_of_study,
      reg_no,
      name_of_office,
      post,
      joining_date,
      office_address,
      request_status,
      status,
    } = req.body;

    Object.assign(forum, {
      name: name ?? forum.name,
      mobile_no: mobile_no ?? forum.mobile_no,
      email: email ?? forum.email,
      course: course ?? forum.course,
      batch: batch ?? forum.batch,
      year_of_study: year_of_study ?? forum.year_of_study,
      reg_no: reg_no ?? forum.reg_no,
      name_of_office: name_of_office ?? forum.name_of_office,
      post: post ?? forum.post,
      joining_date: joining_date ?? forum.joining_date,
      office_address: office_address ?? forum.office_address,
      request_status:
        request_status !== undefined
          ? normalizeRequestStatus(request_status)
          : forum.request_status,
      status:
        status !== undefined
          ? normalizeTinyInt(status, forum.status)
          : forum.status,
      updated_by: req.user?.user_id || 0,
    });

    await forum.save();

    res.json({
      message: "RankForum updated successfully",
      data: forum,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  DELETE 
export const deleteRankForum = async (req, res) => {
  try {
    const forum = await RankForum.findByPk(req.params.id);
    if (!forum) {
      return res.status(404).json({ message: "RankForum not found" });
    }

    await forum.destroy();
    res.json({ message: "RankForum deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
