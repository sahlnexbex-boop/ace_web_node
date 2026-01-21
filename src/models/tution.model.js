import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Tution = sequelize.define(
  "Tution",
  {
    tution_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    tution_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tution_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tution_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
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
    tableName: "tutions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Tution;

