import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Course from "./course.model.js";
import CourseCategory from "./courseCategory.model.js";

const RankHolder = sequelize.define(
  "RankHolder",
  {
    rank_holder_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    student_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    student_rank: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    based_type: {
      type: DataTypes.INTEGER, 
      allowNull: false,
    },
    course_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    category_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    exam_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    joining_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    name_of_office: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    place: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phone_no: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    approval_status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
    student_photo: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    year: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
      allowNull: true,
    },
  },
  {
    tableName: "rank_holders",
    timestamps: false,
  }
);

RankHolder.belongsTo(Course, { foreignKey: "course_id", as: "course" });
RankHolder.belongsTo(CourseCategory, { foreignKey: "category_id", as: "category" });

export default RankHolder;
