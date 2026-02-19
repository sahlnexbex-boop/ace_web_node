import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DynamicFormSubmissions = sequelize.define(
    "DynamicFormSubmissions",
    {
        submission_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        dynmc_event_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
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
        tableName: "dynamic_form_submissions",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default DynamicFormSubmissions;
