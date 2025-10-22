import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Service = sequelize.define(
  "Service",
  {
    service_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    service_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    service_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    service_image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    service_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    service_location: {
      type: DataTypes.STRING,
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
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "social_service",
    timestamps: false,
  }
);

export default Service;
