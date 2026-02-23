import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Course from "./course.model.js";
// import Category from "./courseCategory.model.js";

const Blog = sequelize.define(
  "Blog",
  {
    blog_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    blog_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    blog_image: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    blog_author: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    blog_content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    publishing_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    course_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    other_images: {
      type: DataTypes.JSON,
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
    tableName: "blogs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Blog.belongsTo(Course, {
  foreignKey: "course_id",
  as: "course",
  constraints: false,
});

export default Blog;
