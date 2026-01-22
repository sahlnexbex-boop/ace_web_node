import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Carousel = sequelize.define(
  "carousel",
  {
    carousel_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: "Primary Key",
    },
    carousel_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Title",
    },
    carousel_sec_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Secondary Title",
    },
    carousel_description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Description",
    },
    badge_text: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Small badge/label text shown on the banner",
    },
    badge_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "URL link for the badge",
    },
    carousel_file: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "File (Image or Video)",
    },
    carousel_mobile_file: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "Mobile File (Image or Video)",
    },
    button_type_1: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "1 to 5",
    },
    button_1_link: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Link",
    },
    button_type_2: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "1 to 5",
    },
    button_2_link: {
      type: DataTypes.STRING(255),
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
    tableName: "carousel",
    timestamps: false,
  }
);

export default Carousel;
