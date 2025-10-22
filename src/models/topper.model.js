import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Course from "./course.model.js";
import CourseCategory from "./courseCategory.model.js";

const Topper = sequelize.define(
  "Topper",
  {
    topper_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    topper_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    topper_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    topper_rank: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    exam_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    based_type: {
      type: DataTypes.INTEGER, 
      allowNull: false,
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    tableName: "toppers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Topper.belongsTo(Course, { foreignKey: "course_id", as: "course" });
Topper.belongsTo(CourseCategory, { foreignKey: "category_id", as: "category" });

export default Topper;
