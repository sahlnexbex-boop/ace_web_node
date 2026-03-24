import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Course from "./course.model.js";

const Module = sequelize.define(
  "Module",
  {
    module_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    module_name: { type: DataTypes.STRING, allowNull: false },
    course_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    status: { type: DataTypes.TINYINT, defaultValue: 1 },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE },
    created_by: { type: DataTypes.INTEGER },
    updated_by: { type: DataTypes.INTEGER },
  },
  { tableName: "modules", timestamps: false }
);

Module.belongsTo(Course, { foreignKey: "course_id", as: "course", constraints: false });
Course.hasMany(Module, { foreignKey: "course_id", as: "modules", constraints: false });

export default Module;
