import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import CourseCategory from "./courseCategory.model.js";

const Topper = sequelize.define(
  "Topper",
  {
    topper_id: {
      type: DataTypes.INTEGER.UNSIGNED,
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

    // ❌ removed based_type  
    // ❌ removed course_id

    category_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false, // NOW REQUIRED
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

// Only Category Relation
Topper.belongsTo(CourseCategory, { foreignKey: "category_id", as: "category" });
CourseCategory.hasMany(Topper, { foreignKey: "category_id", as: "toppers" });

export default Topper;
