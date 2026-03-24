import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Course from "./course.model.js";

const Review = sequelize.define(
  "Review",
  {
    review_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    course_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    candidate_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    candidate_position: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    place: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: false,
      defaultValue: 0.0,
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
    tableName: "mst_reviews",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Review.belongsTo(Course, {
  foreignKey: "course_id",
  as: "course",
  constraints: false,
});


export default Review;
