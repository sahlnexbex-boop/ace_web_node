import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const RankForum = sequelize.define(
  "RankForum",
  {
    rankforum_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    mobile_no: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    course: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    batch: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    year_of_study: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    reg_no: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    name_of_office: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    post: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    joining_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    office_address: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    request_status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
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
    tableName: "rank_forums",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default RankForum;
