import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const News = sequelize.define("news", {
  news_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "Primary Key",
  },
  news_title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: "Title",
  },
  date_time: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: "Date and Time",
  },
  news_image: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: "Image",
  },
  news_description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "Description",
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
}, {
  tableName: "news",
  timestamps: false,
});

export default News;
