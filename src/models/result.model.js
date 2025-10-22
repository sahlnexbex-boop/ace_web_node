import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Course from "./course.model.js";
import CourseCategory from "./courseCategory.model.js";

const Result = sequelize.define(
  "Result",
  {
    result_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    result_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    result_description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    result_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    result_type: {
      type: DataTypes.INTEGER, 
      allowNull: false,
      validate: {
        isIn: {
          args: [[1, 2]],
          msg: "Result type must be 1 or 2",
        },
      },
    },
    based_type: {
      type: DataTypes.INTEGER, 
      allowNull: false,
      validate: {
        isIn: {
          args: [[1, 2]],
          msg: "Based type must be 1 or 2",
        },
      },
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "courses",
        key: "course_id",
      },
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "course_categories",
        key: "category_id",
      },
    },
    result_file: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    created_by: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "results",
    timestamps: false,
  }
);

Result.belongsTo(Course, { foreignKey: "course_id", as: "course" });
Result.belongsTo(CourseCategory, { foreignKey: "category_id", as: "category" });

export default Result;
