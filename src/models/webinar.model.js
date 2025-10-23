import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import CourseCategory from "./courseCategory.model.js";

const Webinar = sequelize.define(
  "Webinar",
  {
    webinar_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    webinar_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    webinar_duration: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    webinar_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    course_category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    speaker_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    speaker_position: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    webinar_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    webinar_link: {
      type: DataTypes.STRING,
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
    tableName: "webinars",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Webinar.belongsTo(CourseCategory, {
  foreignKey: "course_category_id",
  as: "category",
});

export default Webinar;
