import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import CourseCategory from "./courseCategory.model.js";

const Course = sequelize.define(
  "Course",
  {
    course_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    course_name: { type: DataTypes.STRING, allowNull: false },
    course_description: { type: DataTypes.STRING },
    course_rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    course_category_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    course_duration: { type: DataTypes.INTEGER },
    course_fee: { type: DataTypes.INTEGER },
    course_overview: { type: DataTypes.STRING(1000) },
    course_syllabus: { type: DataTypes.STRING(1000) },
    course_study_material: { type: DataTypes.STRING(1000) },
    // JSON array of course types, e.g. [1] or [1,2]
    course_type: { type: DataTypes.JSON },
    course_syllabus_file: { type: DataTypes.STRING(500) },
    course_questions_file: { type: DataTypes.STRING(500) },
    course_image: { type: DataTypes.STRING(500) },
    status: { type: DataTypes.TINYINT, defaultValue: 1 },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE },
    created_by: { type: DataTypes.INTEGER },
    updated_by: { type: DataTypes.INTEGER },
  },
  { tableName: "courses", timestamps: false }
);

Course.belongsTo(CourseCategory, {
  foreignKey: "course_category_id",
  as: "category",
});

export default Course;
