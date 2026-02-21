import DynamicEvent from "../models/dynamicEvent.model.js";
import DynamicFormFields from "../models/dynmc_form_fields.model.js";
import sequelize from "../config/db.js";
import { Op } from "sequelize";

// Create Dynamic Event with Form Fields
export const createDynamicEvent = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        let {
            dynmc_event_title,
            dynmc_event_image,
            dynmc_event_description,
            dynmc_event_location,
            dynmc_event_date_time,
            dynmc_event_form_available,
            dynmc_form_header,
            dynmc_form_description,
            status,
            created_by,
            form_fields, // Array of form fields
        } = req.body;

        // Handle image from req.file
        if (req.file) {
            dynmc_event_image = `/uploads/dynamic-events/${req.file.filename}`;
        }

        // Parse form_fields if it's a string
        if (typeof form_fields === "string") {
            try {
                form_fields = JSON.parse(form_fields);
            } catch (e) {
                console.error("Error parsing form_fields:", e);
                form_fields = [];
            }
        }

        // 1. Create the Event
        const newEvent = await DynamicEvent.create(
            {
                dynmc_event_title,
                dynmc_event_image,
                dynmc_event_description,
                dynmc_event_location,
                dynmc_event_date_time,
                dynmc_event_form_available,
                dynmc_form_header,
                dynmc_form_description,
                status,
                created_by,
            },
            { transaction }
        );

        // 2. Create Form Fields if provided
        if (form_fields && Array.isArray(form_fields) && form_fields.length > 0) {
            const fieldsToCreate = form_fields.map((field) => ({
                ...field,
                dynmc_event_id: newEvent.dynmc_event_id,
                created_by: created_by,
            }));

            await DynamicFormFields.bulkCreate(fieldsToCreate, { transaction });
        }

        await transaction.commit();

        // Fetch the complete created event with fields
        const createdEventWithFields = await DynamicEvent.findByPk(newEvent.dynmc_event_id, {
            include: [{
                model: DynamicFormFields,
                as: 'form_fields', // We might need to define this association, or fetch manually if not defined
                required: false
            }]
        }).catch(async () => {
            // Fallback if association isn't defined
            const event = newEvent.toJSON();
            const fields = await DynamicFormFields.findAll({ where: { dynmc_event_id: newEvent.dynmc_event_id } });
            event.form_fields = fields;
            return event;
        });

        // Since I haven't defined associations globally, I'll return the manual fetch for safety in response
        const eventResponse = newEvent.toJSON();
        const fieldsResponse = await DynamicFormFields.findAll({ where: { dynmc_event_id: newEvent.dynmc_event_id } });
        eventResponse.form_fields = fieldsResponse;

        res.status(201).json({
            success: true,
            message: "Dynamic Event created successfully",
            data: eventResponse,
        });
    } catch (error) {
        await transaction.rollback();
        console.error("Error creating dynamic event:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// Get All Dynamic Events with Pagination and Search
export const getAllDynamicEvents = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", status } = req.query;

        const offset = (page - 1) * limit;

        const where = {};

        // ✅ STATUS FILTER (same behavior as blogs)
        if (status === "0" || status === "1") {
            where.status = parseInt(status);
        }

        // ✅ SEARCH FILTER
        if (search) {
            where[Op.or] = [
                { dynmc_event_title: { [Op.like]: `%${search}%` } },
                { dynmc_event_description: { [Op.like]: `%${search}%` } },
            ];
        }

        const { rows, count } = await DynamicEvent.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [["created_at", "DESC"]],
        });

        res.status(200).json({
            message: "Dynamic Events fetched successfully",
            total: count,
            page: Number(page),
            totalPages: Math.ceil(count / limit),
            data: rows,
        });
    } catch (error) {
        console.error("Error fetching dynamic events:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

// Get Single Dynamic Event by ID (including fields)
export const getDynamicEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await DynamicEvent.findByPk(id);

        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        const fields = await DynamicFormFields.findAll({
            where: { dynmc_event_id: id },
            order: [["created_at", "ASC"]], // Or by some sort order if available
        });

        const eventData = event.toJSON();
        eventData.form_fields = fields;

        res.status(200).json({ success: true, data: eventData });
    } catch (error) {
        console.error("Error fetching dynamic event:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// Update Dynamic Event
export const updateDynamicEvent = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        let {
            dynmc_event_title,
            dynmc_event_image,
            dynmc_event_description,
            dynmc_event_location,
            dynmc_event_date_time,
            dynmc_event_form_available,
            dynmc_form_header,
            dynmc_form_description,
            status,
            updated_by,
            form_fields,
        } = req.body;

        // Handle image from req.file
        if (req.file) {
            dynmc_event_image = `/uploads/dynamic-events/${req.file.filename}`;
        }

        // Parse form_fields if it's a string
        if (typeof form_fields === "string") {
            try {
                form_fields = JSON.parse(form_fields);
            } catch (e) {
                console.error("Error parsing form_fields:", e);
                form_fields = [];
            }
        }

        const event = await DynamicEvent.findByPk(id);
        if (!event) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        // 1. Update Event Details
        await event.update(
            {
                dynmc_event_title,
                dynmc_event_image,
                dynmc_event_description,
                dynmc_event_location,
                dynmc_event_date_time,
                dynmc_event_form_available,
                dynmc_form_header,
                dynmc_form_description,
                status,
                updated_by,
            },
            { transaction }
        );

        // 2. Update Form Fields (Delete Old -> Create New)
        // Use user-provided logic: "event create and update time coming event data and form fields array also."
        // This implies a full replacement of fields is acceptable or expected.
        if (form_fields && Array.isArray(form_fields)) {
            // Delete existing fields
            await DynamicFormFields.destroy({
                where: { dynmc_event_id: id },
                transaction,
            });

            // Create new fields
            if (form_fields.length > 0) {
                const fieldsToCreate = form_fields.map((field) => ({
                    ...field,
                    dynmc_event_id: id,
                    updated_by: updated_by, // Track who updated (or created in this context)
                    created_by: updated_by, // Since these are new records
                }));

                await DynamicFormFields.bulkCreate(fieldsToCreate, { transaction });
            }
        }

        await transaction.commit();

        // Fetch updated data
        const updatedEvent = await DynamicEvent.findByPk(id);
        const updatedFields = await DynamicFormFields.findAll({ where: { dynmc_event_id: id } });

        const responseData = updatedEvent.toJSON();
        responseData.form_fields = updatedFields;

        res.status(200).json({
            success: true,
            message: "Dynamic Event updated successfully",
            data: responseData,
        });
    } catch (error) {
        await transaction.rollback();
        console.error("Error updating dynamic event:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// Delete Dynamic Event
export const deleteDynamicEvent = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;

        const event = await DynamicEvent.findByPk(id);
        if (!event) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        // 1. Delete associated form fields
        await DynamicFormFields.destroy({
            where: { dynmc_event_id: id },
            transaction,
        });

        // 2. Delete the event
        await event.destroy({ transaction });

        await transaction.commit();

        res.status(200).json({ success: true, message: "Dynamic Event and associated fields deleted successfully" });
    } catch (error) {
        await transaction.rollback();
        console.error("Error deleting dynamic event:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};
