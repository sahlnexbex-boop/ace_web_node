import { Op } from "sequelize";
import StudyService from "../models/studyService.model.js";
import CourseCategory from "../models/courseCategory.model.js";
import { deleteFile } from "../utils/fileHelper.js";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

// create
export const createStudyService = async (req, res) => {
  try {
    const {
      service_title,
      service_description,
      category_id,
      service_type,
      subject_name,
      exam_name,
      status,
    } = req.body;

    if (!service_title || !category_id || !service_type)
      return res.status(400).json({ message: "Missing required fields" });

    if (![1, 2, 3, 4, 5].includes(Number(service_type)))
      return res.status(400).json({ message: "Invalid service_type. Only 1-5 allowed." });

    const categoryExists = await CourseCategory.findByPk(category_id);
    if (!categoryExists)
      return res.status(400).json({ message: "Invalid category_id" });

    if (!req.file)
      return res.status(400).json({ message: "service_file is required" });

    const service_file = `${SERVER_URL}/uploads/study_services/${req.file.filename}`;

    const newService = await StudyService.create({
      service_title,
      service_description,
      category_id,
      service_type,
      subject_name,
      exam_name,
      service_file,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({ message: "Study Service created successfully", data: newService });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// list
export const getStudyServices = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status, service_type, category_id } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) where.service_title = { [Op.like]: `%${search}%` };
    if (status && [0, 1].includes(Number(status))) where.status = Number(status);
    if (service_type && [1, 2, 3, 4, 5].includes(Number(service_type))) where.service_type = Number(service_type);
    if (category_id) where.category_id = category_id;

    const { rows, count } = await StudyService.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["service_id", "DESC"]],
    });

    res.json({
      message: "Study Services fetched successfully",
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// single
export const getStudyServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await StudyService.findByPk(id);
    if (!service) return res.status(404).json({ message: "Study Service not found" });

    res.json({ message: "Study Service fetched successfully", data: service });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update
export const updateStudyService = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      service_title,
      service_description,
      category_id,
      service_type,
      subject_name,
      exam_name,
      status,
    } = req.body;

    const service = await StudyService.findByPk(id);
    if (!service) return res.status(404).json({ message: "Study Service not found" });

    if (service_type && ![1, 2, 3, 4, 5].includes(Number(service_type)))
      return res.status(400).json({ message: "Invalid service_type. Only 1-5 allowed." });

    if (category_id) {
      const categoryExists = await CourseCategory.findByPk(category_id);
      if (!categoryExists) return res.status(400).json({ message: "Invalid category_id" });
    }

    const newFile = req.file ? `${SERVER_URL}/uploads/study_services/${req.file.filename}` : null;
    if (newFile && service.service_file) deleteFile(service.service_file);

    service.service_title = service_title || service.service_title;
    service.service_description = service_description || service.service_description;
    service.category_id = category_id || service.category_id;
    service.service_type = service_type || service.service_type;
    service.subject_name = subject_name || service.subject_name;
    service.exam_name = exam_name || service.exam_name;
    service.status = [0, 1].includes(Number(status)) ? Number(status) : service.status;
    service.service_file = newFile || service.service_file;
    service.updated_by = req.user?.user_id || 0;
    service.updated_at = new Date();

    await service.save();

    res.json({ message: "Study Service updated successfully", data: service });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// delete
export const deleteStudyService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await StudyService.findByPk(id);
    if (!service) return res.status(404).json({ message: "Study Service not found" });

    if (service.service_file) deleteFile(service.service_file);

    await service.destroy();
    res.json({ message: "Study Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
