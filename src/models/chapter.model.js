import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Module from "./module.model.js";

const Chapter = sequelize.define(
  "Chapter",
  {
    chapter_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    chapter_name: { type: DataTypes.STRING, allowNull: false },
    module_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    is_preview: { type: DataTypes.TINYINT, defaultValue: 0 },
    preview_url: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.TINYINT, defaultValue: 1 },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE },
    created_by: { type: DataTypes.INTEGER },
    updated_by: { type: DataTypes.INTEGER },
  },
  { tableName: "chapters", timestamps: false }
);

Chapter.belongsTo(Module, { foreignKey: "module_id", as: "module", constraints: false });
Module.hasMany(Chapter, { foreignKey: "module_id", as: "chapters", constraints: false });

export default Chapter;
