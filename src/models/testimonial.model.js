import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Testimonial = sequelize.define(
  "Testimonial",
  {
    testimonial_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name_of_candidate: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    position_of_candidate: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    image_of_candidate: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    tableName: "testimonials",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Testimonial;
