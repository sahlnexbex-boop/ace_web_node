import ServiceCarousel from "../models/serviceCarousel.model.js";
import { deleteFile } from "../utils/fileHelper.js";

//    CREATE (single & multiple)
export const createServiceCarousel = async (req, res) => {
    try {
        const { status } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Image is required" });
        }

        const records = req.files.map((file) => ({
            image_url: `/uploads/service_carousel/${file.filename}`,
            status: [0, 1].includes(Number(status)) ? Number(status) : 1,
            created_by: req.user?.user_id || 0,
        }));

        const data = await ServiceCarousel.bulkCreate(records);

        res.status(201).json({
            message: "Service carousel created successfully",
            data,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//    LIST
export const getServiceCarousels = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if ([0, 1].includes(Number(status))) where.status = Number(status);

        const { rows, count } = await ServiceCarousel.findAndCountAll({
            where,
            limit: Number(limit),
            offset: Number(offset),
            order: [["service_carousel_id", "DESC"]],
        });

        res.json({
            message: "Service carousel list fetched",
            total: count,
            page: Number(page),
            totalPages: Math.ceil(count / limit),
            data: rows,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//    GET SINGLE
export const getServiceCarouselById = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await ServiceCarousel.findByPk(id);
        if (!data)
            return res.status(404).json({ message: "Service carousel not found" });

        res.json({ message: "Fetched successfully", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//    BULK DELETE
export const bulkDeleteServiceCarousel = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || !ids.length)
            return res.status(400).json({ message: "ids array required" });

        const records = await ServiceCarousel.findAll({
            where: { service_carousel_id: ids },
        });

        records.forEach((item) => {
            if (item.image_url) deleteFile(item.image_url);
        });

        await ServiceCarousel.destroy({
            where: { service_carousel_id: ids },
        });

        res.json({ message: "Bulk delete successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//    BULK STATUS UPDATE
export const bulkStatusUpdate = async (req, res) => {
    try {
        const { ids, status } = req.body;

        if (!Array.isArray(ids) || ![0, 1].includes(Number(status)))
            return res.status(400).json({ message: "Invalid request" });

        await ServiceCarousel.update(
            { status: Number(status) },
            { where: { service_carousel_id: ids } }
        );

        res.json({ message: "Status updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};