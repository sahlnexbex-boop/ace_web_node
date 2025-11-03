import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import CourseCategory from "./courseCategory.model.js";

const VideoClass = sequelize.define(
  "video_classes",
  {
    class_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: "Primary Key",
    },
    class_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Title",
    },
    date_time: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "Date and Time",
    },
    class_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "Image",
    },
    video_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: "Video URL",
    },
    category_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: "Category ID",
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: "Status (1=Active, 0=Inactive)",
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Created By",
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Updated By",
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
    tableName: "video_classes",
    timestamps: false,
  }
);

VideoClass.belongsTo(CourseCategory, {
  foreignKey: "category_id",
  as: "category",
});

export default VideoClass;
