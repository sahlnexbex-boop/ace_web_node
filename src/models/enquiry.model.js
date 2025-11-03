import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Enquiry = sequelize.define(
  "enquiries",
  {
    enquiry_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    cstmr_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cstmr_email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cstmr_phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cstmr_message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    enquiry_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "1: General, 2: Course, 3: Event, 4: Other",
    },
    submit_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    enquiry_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "1: Pending, 2: In Progress, 3: Closed",
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER,
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Enquiry;
