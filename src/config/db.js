import { Sequelize } from "sequelize";
import { DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_DIALECT } from "./env.js";

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: DB_DIALECT,
  logging: false
});

export default sequelize;
