import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";
import bcrypt from "bcrypt";

class Student extends Model {}

Student.init(
  {
    std_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    std_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    std_email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },

    std_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    admission_no: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },

    registre_no: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },

    is_ace_std: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    std_photo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
    created_by: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Student",
    tableName: "mst_students",
    timestamps: false,
  }
);

Student.beforeCreate(async (student) => {
  student.password = await bcrypt.hash(student.password, 10);
});

Student.beforeUpdate(async (student) => {
  if (student.changed("password")) {
    student.password = await bcrypt.hash(student.password, 10);
  }
});

export default Student;
