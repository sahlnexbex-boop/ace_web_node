import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DynamicEvent = sequelize.define(
  "DynamicEvent",
  {
    dynmc_event_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    dynmc_event_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    dynmc_event_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    dynmc_event_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dynmc_event_location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    dynmc_event_date_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    dynmc_event_form_available: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
    dynmc_form_header: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    dynmc_form_description: {
      type: DataTypes.TEXT,
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
    tableName: "dynamic_events",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default DynamicEvent;
