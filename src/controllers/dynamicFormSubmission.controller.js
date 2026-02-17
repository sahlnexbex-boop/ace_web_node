import { Op } from "sequelize";
import DynamicFormSubmissions from "../models/dynmc_form_submission.model.js";
import DynamicSubmitValues from "../models/dynmc_submit_values.model.js";
import DynamicEvent from "../models/dynamicEvent.model.js";
import DynamicFormFields from "../models/dynmc_form_fields.model.js"; // For validation/labels if needed
import sequelize from "../config/db.js";

// Define associations manually if not centralized
DynamicFormSubmissions.belongsTo(DynamicEvent, { foreignKey: 'dynmc_event_id', as: 'event' });
DynamicSubmitValues.belongsTo(DynamicFormFields, { foreignKey: 'form_field_id', as: 'field_info' });
DynamicFormSubmissions.hasMany(DynamicSubmitValues, { foreignKey: 'submission_id', as: 'values' });

// Submit a Form
export const startFormSubmission = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        let {
            dynmc_event_id,
            created_by, // User ID if authenticated
            submitted_values, // Array of { form_field_id, form_field_value }
        } = req.body;

        // Parse submitted_values if it's a JSON string (common in FormData)
        if (typeof submitted_values === 'string') {
            try {
                submitted_values = JSON.parse(submitted_values);
            } catch (error) {
                console.error("Error parsing submitted_values JSON:", error);
                // Decide whether to fail or proceed with empty/partial. Failing is safer.
                await transaction.rollback();
                return res.status(400).json({ success: false, message: "Invalid submitted_values format" });
            }
        }

        // Ensure it's an array
        if (!Array.isArray(submitted_values)) {
            submitted_values = [];
        }

        // Handle File Uploads
        // req.files is populated by dynamicUpload middleware (using multer .any())
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            req.files.forEach((file) => {
                // Logic: match file.fieldname to form_field_id
                // If fieldname is just ID "101", use it. If "field_101", strip prefix.
                let fieldId = file.fieldname;
                if (fieldId.startsWith("field_")) {
                    fieldId = fieldId.replace("field_", "");
                }

                // Normalize path to be relative for frontend access
                const relativePath = `/uploads/dynamic_submissions/${file.filename}`;

                // Check if entry exists in submitted_values
                const existingEntry = submitted_values.find(
                    (v) => String(v.form_field_id) === String(fieldId)
                );

                if (existingEntry) {
                    existingEntry.form_field_value = relativePath;
                } else {
                    // Add new entry for the file
                    submitted_values.push({
                        form_field_id: fieldId, // Ensure it matches key
                        form_field_value: relativePath,
                    });
                }
            });
        }

        // Validate Event Existence
        const event = await DynamicEvent.findByPk(dynmc_event_id);
        if (!event) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        // --- NEW VALIDATION LOGIC ---
        // Fetch valid field IDs for this event
        const validFields = await DynamicFormFields.findAll({
            where: { dynmc_event_id: dynmc_event_id, status: 1 },
            attributes: ['form_field_id', 'form_field_label']
        });

        const validFieldIds = validFields.map(f => f.form_field_id);

        // Check if all submitted values correspond to valid fields
        for (const val of submitted_values) {
            if (!validFieldIds.includes(parseInt(val.form_field_id))) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Invalid form_field_id: ${val.form_field_id}. It does not belong to this event.`
                });
            }
        }
        // -----------------------------

        // 1. Create Submission Record
        const newSubmission = await DynamicFormSubmissions.create(
            {
                dynmc_event_id,
                created_by,
                status: 1,
            },
            { transaction }
        );

        // 2. Create Submit Values
        if (submitted_values.length > 0) {
            const valuesToCreate = submitted_values.map((val) => {
                // Since form_field_value is DataTypes.JSON, Sequelize will auto-stringify
                // So we need to ensure we're passing the actual value, not a stringified version
                let fieldValue = val.form_field_value;

                // If the value is a string that looks like JSON, try to parse it
                if (typeof fieldValue === 'string') {
                    try {
                        // Check if it's a JSON-stringified value (starts with " or [ or {)
                        if (fieldValue.startsWith('"') || fieldValue.startsWith('[') || fieldValue.startsWith('{')) {
                            fieldValue = JSON.parse(fieldValue);
                        }
                    } catch (e) {
                        // If parsing fails, keep the original string value
                        // This is fine - it's just a regular string
                    }
                }

                return {
                    submission_id: newSubmission.submission_id,
                    form_field_id: val.form_field_id,
                    form_field_value: fieldValue,
                    created_by: created_by,
                };
            });

            await DynamicSubmitValues.bulkCreate(valuesToCreate, { transaction });
        }

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: "Form submitted successfully",
            data: {
                submission_id: newSubmission.submission_id,
            },
        });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Error submitting form:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// Get All Submissions (with Pagination, Filter, Search)
export const getAllSubmissions = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", event_id, status } = req.query;
        const offset = (page - 1) * limit;

        const whereCondition = {};

        // Filter by Event ID if provided
        if (event_id) {
            whereCondition.dynmc_event_id = event_id;
        }

        // Filter by Status if provided
        if (status !== undefined && status !== "") {
            whereCondition.status = Number(status);
        }

        // Search Logic:
        // Searching submissions is complex. 
        // Option 1: Search by Submission ID (direct)
        // Option 2: Search by Event Title (via include)
        // We'll implement searching by Event Title using include.

        const includeOptions = [
            {
                model: DynamicEvent,
                as: 'event', // Assuming standard naming, or we need to check associations or alias
                required: false, // Left join
                attributes: ['dynmc_event_title']
            }
        ];

        // If search exists, we try to match Event Title OR maybe submission ID?
        // Note: Creating a where clause on an included model requires the model's alias.
        // Since I haven't explicitly set aliases in `src/models`, Sequelize typically uses the model name.
        // However, without defining associations in a central place (models/index.js), eager loading might fail if associations aren't set up.
        // Assuming implicit association or I'll setup a simple lookup.

        // Let's rely on basic filtering for now to avoid Association Errors if not set up.
        // If the user wants to search by event title, they can first search events, get ID, then filter here.
        // BUT, I can add a basic ID search here.
        if (search) {
            whereCondition[Op.or] = [
                { submission_id: { [Op.like]: `%${search}%` } },
                // Add more if we join tables clearly
            ];
        }

        const { count, rows } = await DynamicFormSubmissions.findAndCountAll({
            where: whereCondition,
            include: [
                {
                    model: DynamicEvent,
                    as: 'event',
                    attributes: ['dynmc_event_title']
                },
                {
                    model: DynamicSubmitValues,
                    as: 'values',
                    include: [{
                        model: DynamicFormFields,
                        as: 'field_info',
                        attributes: ['form_field_label', 'form_field_key', 'form_field_type']
                    }]
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true, // Important when including hasMany association with limit/offset
        });

        res.status(200).json({
            message: "Submissions fetched successfully",
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit),
            data: rows,
        });

    } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
}

// Get Single Submission with Details
export const getSubmissionById = async (req, res) => {
    try {
        const { id } = req.params;

        const submission = await DynamicFormSubmissions.findByPk(id);
        if (!submission) {
            return res.status(404).json({ success: false, message: "Submission not found" });
        }

        const values = await DynamicSubmitValues.findAll({
            where: { submission_id: id },
        });

        // Optional: Get Field Labels to make the response more meaningful
        // Implementation depends on performance needs. For now, returning raw values.

        const responseData = submission.toJSON();
        responseData.values = values;

        res.status(200).json({ success: true, data: responseData });
    } catch (error) {
        console.error("Error fetching submission:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// Update/Edit Submission
export const updateSubmission = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params; // submission_id
        let {
            submitted_values, // Array of { form_field_id, form_field_value }
            updated_by
        } = req.body;

        // Parse submitted_values from JSON string if necessary
        if (typeof submitted_values === 'string') {
            try {
                submitted_values = JSON.parse(submitted_values);
            } catch (error) {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: "Invalid submitted_values format" });
            }
        }
        if (!Array.isArray(submitted_values)) submitted_values = [];

        // Handle File Uploads (Update logic)
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            req.files.forEach((file) => {
                let fieldId = file.fieldname;
                if (fieldId.startsWith("field_")) {
                    fieldId = fieldId.replace("field_", "");
                }
                const relativePath = `/uploads/dynamic_submissions/${file.filename}`;

                const existingEntry = submitted_values.find(
                    (v) => String(v.form_field_id) === String(fieldId)
                );

                if (existingEntry) {
                    existingEntry.form_field_value = relativePath;
                } else {
                    submitted_values.push({
                        form_field_id: fieldId,
                        form_field_value: relativePath,
                    });
                }
            });
        }

        const submission = await DynamicFormSubmissions.findByPk(id);
        if (!submission) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: "Submission not found" });
        }

        // Update submission metadata
        await submission.update({ updated_by }, { transaction });

        if (submitted_values.length > 0) { // Check length after potential file additions

            // We'll delete old values for this submission and recreate them.

            await DynamicSubmitValues.destroy({
                where: { submission_id: id },
                transaction
            });

            const valuesToCreate = submitted_values.map((val) => {
                // Since form_field_value is DataTypes.JSON, Sequelize will auto-stringify
                // So we need to ensure we're passing the actual value, not a stringified version
                let fieldValue = val.form_field_value;

                // If the value is a string that looks like JSON, try to parse it
                if (typeof fieldValue === 'string') {
                    try {
                        // Check if it's a JSON-stringified value (starts with " or [ or {)
                        if (fieldValue.startsWith('"') || fieldValue.startsWith('[') || fieldValue.startsWith('{')) {
                            fieldValue = JSON.parse(fieldValue);
                        }
                    } catch (e) {
                        // If parsing fails, keep the original string value
                        // This is fine - it's just a regular string
                    }
                }

                return {
                    submission_id: id,
                    form_field_id: val.form_field_id,
                    form_field_value: fieldValue,
                    updated_by: updated_by,
                    created_by: updated_by // treated as re-creation
                };
            });

            await DynamicSubmitValues.bulkCreate(valuesToCreate, { transaction });
        }

        await transaction.commit();

        res.status(200).json({ success: true, message: "Submission updated successfully" });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Error updating submission:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
}

// Delete Submission
export const deleteSubmission = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;

        const submission = await DynamicFormSubmissions.findByPk(id);
        if (!submission) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: "Submission not found" });
        }

        // 1. Delete associated values
        await DynamicSubmitValues.destroy({
            where: { submission_id: id },
            transaction,
        });

        // 2. Delete submission
        await submission.destroy({ transaction });

        await transaction.commit();

        res.status(200).json({ success: true, message: "Submission deleted successfully" });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Error deleting submission:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// Excel Download
export const downloadSubmissionsExcel = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            event_id,
            export: exportType
        } = req.query;

        const whereCondition = {};
        if (event_id) {
            whereCondition.dynmc_event_id = event_id;
        }

        if (search) {
            whereCondition[Op.or] = [
                { submission_id: { [Op.like]: `%${search}%` } },
            ];
        }

        let rows;
        const queryOptions = {
            where: whereCondition,
            include: [
                {
                    model: DynamicEvent,
                    as: 'event', // Ensure association alias matches
                    attributes: ['dynmc_event_title']
                }
            ],
            order: [['created_at', 'DESC']]
        };

        if (exportType === "all") {
            rows = await DynamicFormSubmissions.findAll(queryOptions);
        } else {
            const offset = (Number(page) - 1) * Number(limit);
            rows = await DynamicFormSubmissions.findAll({
                ...queryOptions,
                limit: Number(limit),
                offset
            });
        }

        // Fetch all values for these submissions to map them
        const submissionIds = rows.map(r => r.submission_id);
        const allValues = await DynamicSubmitValues.findAll({
            where: { submission_id: { [Op.in]: submissionIds } }
        });

        // Group values by submission_id
        const valuesMap = {}; // submission_id -> { field_id: value }
        allValues.forEach(v => {
            if (!valuesMap[v.submission_id]) valuesMap[v.submission_id] = {};
            valuesMap[v.submission_id][v.form_field_id] = v.form_field_value;
        });

        // Get Form Fields headers if event_id is present
        let dynamicHeaders = [];
        if (event_id) {
            const eventFields = await DynamicFormFields.findAll({
                where: { dynmc_event_id: event_id },
                order: [['form_field_id', 'ASC']]
            });
            dynamicHeaders = eventFields.map(f => ({
                header: f.form_field_label,
                key: `field_${f.form_field_id}`,
                width: 20
            }));
        }

        const ExcelJS = await import('exceljs'); // function-scoped import if not at top
        const workbook = new ExcelJS.default.Workbook(); // Use default if it's a default export
        const worksheet = workbook.addWorksheet("Submissions");

        // Define Base Columns
        const columns = [
            { header: "ID", key: "id", width: 10 },
            { header: "Event", key: "event_title", width: 30 },
            { header: "Date", key: "created_at", width: 20 },
        ];

        // Add dynamic columns if event specific
        if (dynamicHeaders.length > 0) {
            worksheet.columns = [...columns, ...dynamicHeaders];
        } else if (event_id) {
            // If event selected but no fields found (unlikely but possible)
            worksheet.columns = columns;
        } else {
            // Generic export (maybe just dump known values? or just summary)
            // For now, let's stick to summary + maybe a "Values" column as JSON?
            // Or we simply don't show dynamic fields in combined export.
            worksheet.columns = [...columns, { header: "Data (Summary)", key: "data_summary", width: 50 }];
        }

        // Style Header
        worksheet.getRow(1).font = { bold: true };

        rows.forEach(row => {
            const rowData = {
                id: row.submission_id,
                event_title: row.event ? row.event.dynmc_event_title : "Unknown",
                created_at: row.created_at ? new Date(row.created_at).toLocaleString() : ""
            };

            const subValues = valuesMap[row.submission_id] || {};

            if (event_id && dynamicHeaders.length > 0) {
                // Map dynamic fields
                dynamicHeaders.forEach(h => {
                    // key is field_101
                    const fieldId = h.key.replace("field_", "");
                    rowData[h.key] = subValues[fieldId] || "";
                });
            } else if (!event_id) {
                // Summary view
                rowData["data_summary"] = JSON.stringify(subValues);
            }

            worksheet.addRow(rowData);
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=submissions_${event_id ? `event_${event_id}_` : ''}${exportType === "all" ? "full" : `page_${page}`}.xlsx`
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Excel Export Error:", error);
        res.status(500).json({ message: "Failed to export data" });
    }
};
