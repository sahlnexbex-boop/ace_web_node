import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Branches = sequelize.define(
    "Branches",
    {
        branch_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        branch_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        branch_address: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        branch_phone: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        status: {
            type: DataTypes.TINYINT,
            defaultValue: 1,
        },
        V2_branch: {
            type: DataTypes.INTEGER,
            allowNull: true,
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
        tableName: "mst_branches",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default Branches;
