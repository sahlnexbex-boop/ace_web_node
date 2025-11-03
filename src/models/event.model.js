import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Event = sequelize.define(
  "Event",
  {
    event_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    event_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    event_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    event_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    event_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    event_location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    date_time: {
      type: DataTypes.DATE,
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
    tableName: "events",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Event;
