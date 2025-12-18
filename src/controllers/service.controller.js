import { Op } from "sequelize";
import Service from "../models/service.model.js";
import { deleteFile } from "../utils/fileHelper.js";

const isUnsupportedFile = (mimetype) => {
  return !mimetype.startsWith("image/");
};

//  Create
export const createService = async (req, res) => {
  try {
    const {
      service_title,
      service_description,
      service_date,
      service_location,
      status,
    } = req.body;

    if (!service_title || !service_description || !service_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (isUnsupportedFile(req.files?.service_image[0].mimetype)) {
      return res
        .status(400)
        .json({ message: "Invalid file type. Images only allowed" });
    }

    if (
      req.files?.other_images &&
      req.files.other_images.some((img) => isUnsupportedFile(img.mimetype))
    ) {
      return res
        .status(400)
        .json({ message: "Invalid file type. Images only allowed" });
    }

    const service_image = req.files?.service_image
      ? `/uploads/services/${req.files.service_image[0].filename}`
      : null;

    const other_images = req.files?.other_images
      ? req.files.other_images.map(
          (img) => `/uploads/services/${img.filename}`
        )
      : [];

    const service = await Service.create({
      service_title,
      service_description,
      service_image,
      other_images,
      service_date,
      service_location,
      status: [0, 1].includes(Number(status)) ? Number(status) : 1,
      created_by: req.user?.user_id || 0,
    });

    res.status(201).json({
      message: "Service created successfully",
      data: service,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// List
export const getServices = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status, date } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where.service_title = { [Op.like]: `%${search}%` };
    }

    if (status && [0, 1].includes(Number(status))) {
      where.status = Number(status);
    }

    if (date) {
      const startOfDay = new Date(`${date}T00:00:00`);
      const endOfDay = new Date(`${date}T23:59:59`);

      where.service_date = { [Op.between]: [startOfDay, endOfDay] };
    }

    const { rows, count } = await Service.findAndCountAll({
      where,
      order: [["service_id", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      message: "Services fetched successfully",
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Get single
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    res.json({
      message: "Service fetched successfully",
      data: service,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Update
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      service_title,
      service_description,
      service_date,
      service_location,
      status,
    } = req.body;

    const service = await Service.findByPk(id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    let existingOtherImages = [];
    if (service.other_images) {
      try {
        existingOtherImages = Array.isArray(service.other_images)
          ? service.other_images
          : JSON.parse(service.other_images);
      } catch {
        existingOtherImages = [];
      }
    }

    if(
      req.files?.other_images &&
      req.files.other_images.some((img) => isUnsupportedFile(img.mimetype))
    ) {
      return res
        .status(400)
        .json({ message: "Invalid file type. Images only allowed" });
    }

    if(
      req.files?.service_image &&
      isUnsupportedFile(req.files.service_image[0].mimetype)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid file type. Images only allowed" });
    }

    // if(req.files?.other_images) {
    //   if (req.files.other_images.some((img) => isUnsupportedFile(img.mimetype))) {
    //     return res
    //       .status(400)
    //       .json({ message: "Invalid file type. Images only allowed" });
    //   }
    // }

    // if (isUnsupportedFile(req.files?.service_image[0].mimetype)) {
    //   return res
    //     .status(400)
    //     .json({ message: "Invalid file type. Images only allowed" });
    // }

    const newServiceImage = req.files?.service_image
      ? `/uploads/services/${req.files.service_image[0].filename}`
      : null;

    const newOtherImages = req.files?.other_images
      ? req.files.other_images.map(
          (img) => `/uploads/services/${img.filename}`
        )
      : [];

    if (newServiceImage && service.service_image)
      deleteFile(service.service_image);
    if (newOtherImages.length && existingOtherImages.length) {
      existingOtherImages.forEach((oldImg) => deleteFile(oldImg));
    }

    service.service_title = service_title || service.service_title;
    service.service_description =
      service_description || service.service_description;
    service.service_image = newServiceImage || service.service_image;
    service.other_images = newOtherImages.length
      ? newOtherImages
      : existingOtherImages;
    service.service_date = service_date || service.service_date;
    service.service_location = service_location || service.service_location;
    service.status = [0, 1].includes(Number(status))
      ? Number(status)
      : service.status;
    service.updated_by = req.user?.user_id || 0;
    service.updated_at = new Date();

    await service.save();

    res.json({
      message: "Service updated successfully",
      data: service,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Delete
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    let otherImages = [];
    if (service.other_images) {
      try {
        otherImages = Array.isArray(service.other_images)
          ? service.other_images
          : JSON.parse(service.other_images);
      } catch {
        otherImages = [];
      }
    }

    if (service.service_image) deleteFile(service.service_image);
    if (otherImages.length) {
      otherImages.forEach((img) => deleteFile(img));
    }

    await service.destroy();

    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
