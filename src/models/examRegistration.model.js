import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import ScholarshipExam from "./scholarshipExam.model.js";
import Student from "./student.model.js";

const ExamRegistration = sequelize.define(
  "ExamRegistration",
  {
    reg_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    mobile: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    branch: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    exam_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    std_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    registration_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },

    is_ace_std: {
      type: DataTypes.TINYINT,
      defaultValue: 0, // 0 = No, 1 = Yes
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
    tableName: "exam_registration",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
ExamRegistration.belongsTo(ScholarshipExam, {
  foreignKey: "exam_id",
  targetKey: "exam_id",
  constraints: false,
});
Student.hasMany(ExamRegistration, {
  foreignKey: "std_id",
  targetKey: "std_id",
  constraints: false,
});

export default ExamRegistration;
