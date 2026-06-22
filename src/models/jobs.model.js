import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Job = sequelize.define(
  "Job",
  {
    job_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    job_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    job_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    job_branches: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    job_type: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    opening_seats: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    experiance_level: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    job_image: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    apply_deadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },

    created_by: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
    },

    updated_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
  },
  {
    tableName: "jobs",
    timestamps: true,
    createdAt: "create_at",
    updatedAt: "update_at",
  }
);

export default Job;
