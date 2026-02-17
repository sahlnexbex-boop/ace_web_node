import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DynamicFormFields = sequelize.define(
    "DynamicFormFields",
    {
        form_field_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        form_field_key: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        dynmc_event_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        form_field_label: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        // enum types
        form_field_type: {
            type: DataTypes.ENUM("text", "email", "password", "number", "textarea", "select", "radio", "checkbox", "file", "image", "video", "audio", "url", "tel", "date", "time", "datetime-local", "month", "week", "range", "color", "submit", "reset", "button"),
            allowNull: false,
        },
        is_required: {
            type: DataTypes.TINYINT,
            defaultValue: 1,
        },
        options: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null,
        },
        status: {
            type: DataTypes.TINYINT,
            defaultValue: 1,
        },
        created_by: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        updated_by: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        tableName: "dynamic_form_fields",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default DynamicFormFields;
