import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Book = sequelize.define(
  "books",
  {
    book_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: "Primary Key",
    },
    book_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Title",
    },
    book_description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Description",
    },
    book_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Price",
    },
    book_author: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Author",
    },
    book_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "Image",
    },
    book_language: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Language",
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Category ID",
    },
    book_file: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "File (PDF, DOC, etc.)",
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: "Status (1=Active, 0=Inactive)",
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Created By",
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Updated By",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "publications",
    timestamps: false,
  }
);

export default Book;
