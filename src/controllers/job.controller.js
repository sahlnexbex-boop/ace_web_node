import Job from "../models/jobs.model.js";
import { Op } from "sequelize";
import { deleteFile } from "../utils/fileHelper.js";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

//  CREATE JOB 
export const createJob = async (req, res) => {
  try {
    const {
      job_title,
      job_description,
      job_location,
      job_type,
      opening_seats,
      experiance_level,
      apply_deadline,
      status,
    } = req.body;

    //  Required fields
    if (
      !job_title ||
      !job_description ||
      !job_location ||
      !job_type ||
      !experiance_level ||
      !apply_deadline
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const job_image = req.file
      ? `/uploads/jobs/${req.file.filename}`
      : null;

    //  Status check - default to 1 if not explicitly 0 or 1
    const parsedStatus =
      status !== undefined && status !== null && status !== "" && [0, 1].includes(Number(status))
        ? Number(status)
        : 1;

    const job = await Job.create({
      job_title,
      job_description,
      job_location,
      job_type,
      opening_seats: opening_seats || null,
      experiance_level,
      apply_deadline,
      job_image,
      status: parsedStatus,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({
      message: "Job created successfully",
      data: job,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  LIST JOBS 
export const getJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status, type, location } =
      req.query;

    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where.job_title = { [Op.like]: `%${search}%` };
    }

    if (location) {
      where.job_location = { [Op.like]: `%${location}%` };
    }

    if (type) {
      where.job_type = { [Op.like]: `%${type}%` };
    }

    if (status !== undefined && [0, 1].includes(Number(status))) {
      where.status = Number(status);
    }

    const { rows, count } = await Job.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["job_id", "DESC"]],
    });

    res.json({
      message: "Jobs fetched successfully",
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  GET JOB BY ID 
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ message: "Job fetched successfully", data: job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  UPDATE JOB 
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const data = req.body;

    //  Update image if new file uploaded
    if (req.file) {
      if (job.job_image) deleteFile(job.job_image);
      job.job_image = `/uploads/jobs/${req.file.filename}`;
    }

    job.job_title = data.job_title || job.job_title;
    job.job_description = data.job_description || job.job_description;
    job.job_location = data.job_location || job.job_location;
    job.job_type = data.job_type || job.job_type;

    job.opening_seats =
      data.opening_seats !== undefined ? data.opening_seats : job.opening_seats;

    job.experiance_level =
      data.experiance_level || job.experiance_level;

    job.apply_deadline = data.apply_deadline || job.apply_deadline;

    if (data.status !== undefined && data.status !== null && data.status !== "") {
      if ([0, 1].includes(Number(data.status))) {
        job.status = Number(data.status);
      }
    }

    job.updated_by = req.user?.user_id || 0;

    await job.save();

    res.json({
      message: "Job updated successfully",
      data: job,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  DELETE JOB 
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.job_image) deleteFile(job.job_image);

    await job.destroy();

    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
