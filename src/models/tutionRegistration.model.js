import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Tution from "./tution.model.js";

const TutionRegistration = sequelize.define(
  "TutionRegistration",
  {
    registration_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    tution_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    std_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    guardian_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    guardian_contact: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    school: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    standard: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    medium: {
      type: DataTypes.ENUM("english", "malayalam"),
      allowNull: false,
      defaultValue: "english",
    },
    request_status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: "1=requested, 2=ongoing, 3=completed",
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
    tableName: "tution_registrations",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

TutionRegistration.belongsTo(Tution, {
  foreignKey: "tution_id",
  as: "tution",
  constraints: false,
});

export default TutionRegistration;

