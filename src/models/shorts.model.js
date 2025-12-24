import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Shorts = sequelize.define(
  "shorts",
  {
    shorts_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: "Primary Key",
    },
    shorts_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Title",
    },
    shorts_file: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "File (Video)",
    },
    shorts_link: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "Link",
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: "Status (0 = inactive, 1 = active)",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Created At",
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Created By",
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      comment: "Updated At",
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Updated By",
    },
  },
  {
    tableName: "shorts",
    timestamps: false,
  }
);

export default Shorts;
