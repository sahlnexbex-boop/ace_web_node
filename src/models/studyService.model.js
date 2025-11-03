import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import CourseCategory from "./courseCategory.model.js";

const StudyService = sequelize.define(
  "study_services",
  {
    service_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: "Primary Key",
    },
    service_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Title",
    },
    service_description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Description",
    },
    category_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: "Category ID",
    },
    service_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Type (1-5)",
    },
    subject_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    exam_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    service_file: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: "File (PDF/DOC/etc.)",
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "study_services",
    timestamps: false,
  }
);

StudyService.belongsTo(CourseCategory, {
  foreignKey: "category_id",
  as: "category",
});

export default StudyService;
