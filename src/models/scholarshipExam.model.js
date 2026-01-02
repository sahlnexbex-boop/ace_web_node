import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ScholarshipExam = sequelize.define(
  "ScholarshipExam",
  {
    exam_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    exam_title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    exam_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    exam_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    exam_time: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    exam_location: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    last_apply_date: {
      type: DataTypes.DATEONLY,
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
    tableName: "scholarship_exams",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);


export default ScholarshipExam;
