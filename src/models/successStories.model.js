import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import CourseCategory from "./courseCategory.model.js";

const SuccessStory = sequelize.define(
  "SuccessStory",
  {
    stories_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    stories_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name_of_candidate: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    course_category_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    thumbnail_image: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    youtube_video_link: {
      type: DataTypes.STRING(255),
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
    tableName: "success_stories",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

SuccessStory.belongsTo(CourseCategory, { foreignKey: "course_category_id", as: "category" });

export default SuccessStory;
