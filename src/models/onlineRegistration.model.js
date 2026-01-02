import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import CourseCategory from "./courseCategory.model.js";
import Course from "./course.model.js";

const OnlineRegistration = sequelize.define(
  "OnlineRegistration",
  {
    registration_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    branch: DataTypes.STRING(100),
    department_id: DataTypes.INTEGER.UNSIGNED,
    course_id: DataTypes.INTEGER.UNSIGNED,

    student_name: DataTypes.STRING(150),
    father_name: DataTypes.STRING(150),
    date_of_birth: DataTypes.DATEONLY,

    gender: {
      type: DataTypes.ENUM("Male", "Female", "Others"),
    },

    marital_status: {
      type: DataTypes.ENUM("Married", "Single"),
    },

    religion: DataTypes.STRING(100),
    community: DataTypes.STRING(100),

    qualification: DataTypes.JSON,

    house_name: DataTypes.STRING(150),
    place: DataTypes.STRING(150),
    district: DataTypes.STRING(100),
    pin_code: DataTypes.STRING(10),

    email: DataTypes.STRING(150),
    phone_number: DataTypes.STRING(10),
    second_phone_no: DataTypes.STRING(10),

    message: DataTypes.TEXT,
    student_photo: DataTypes.STRING(255),

    apply_status: {
      type: DataTypes.ENUM(
        "requested",
        "ongoing",
        "closed-success",
        "closed-rejected"
      ),
      defaultValue: "requested",
    },

    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },

    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER,
  },
  {
    tableName: "online_registrations",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

OnlineRegistration.belongsTo(CourseCategory, {
  foreignKey: "department_id",
  as: "department",
  constraints: false,
});

OnlineRegistration.belongsTo(Course, {
  foreignKey: "course_id",
  as: "course",
  constraints: false,
});

export default OnlineRegistration;
