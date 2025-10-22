import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";
import CourseType from "./courseType.model.js";

class CourseCategory extends Model {}

CourseCategory.init(
  {
    category_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    category_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    category_description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    total_courses: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    course_type_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: CourseType,
        key: "type_id",
      },
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    category_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
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
    sequelize,
    modelName: "CourseCategory",
    tableName: "course_category",
    timestamps: false,
  }
);

CourseCategory.belongsTo(CourseType, {
  foreignKey: "course_type_id",
  as: "courseType",
});

export default CourseCategory;
