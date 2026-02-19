import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const dynamic_submit_values = sequelize.define(
  "dynamic_submit_values",
  {
    submit_values_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    submission_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    form_field_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    form_field_value: {
      type: DataTypes.JSON,
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
    tableName: "dynamic_submit_values",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default dynamic_submit_values;
