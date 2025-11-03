import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import CourseCategory from "./courseCategory.model.js";

const CurrentAffair = sequelize.define(
  "current_affairs",
  {
    affair_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: "Primary Key",
    },
    affair_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Title",
    },
    affair_description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Description",
    },
    affair_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Price",
    },
    publishing_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "Publishing Date",
    },
    category_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: "Category ID",
    },
    affair_file: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "File (PDF, DOC, etc.)",
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
    tableName: "current_affairs",
    timestamps: false,
  }
);

CurrentAffair.belongsTo(CourseCategory, {
  foreignKey: "category_id",
  as: "category",
});

export default CurrentAffair;
