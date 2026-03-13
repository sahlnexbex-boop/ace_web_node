import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Job from "./jobs.model.js";

const JobApplication = sequelize.define(
  "JobApplication",
  {
    application_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    candidate_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    candidate_email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    candidate_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    candidate_address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    job_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    resume_file: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    cover_letter: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    application_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    application_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
    created_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    updated_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
  },
  {
    tableName: "job_applications",
    timestamps: true,
    createdAt: "create_at",
    updatedAt: "update_at",
  }
);

JobApplication.belongsTo(Job, {
  foreignKey: "job_id",
  targetKey: "job_id",
});
Job.hasMany(JobApplication, {
  foreignKey: "job_id",
});

export default JobApplication;
