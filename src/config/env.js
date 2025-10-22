import dotenv from "dotenv";
dotenv.config();

export const {
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_NAME,
  DB_DIALECT,
  PORT,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_EXPIRES,
  REFRESH_EXPIRES,
  EMAIL_USER,
  EMAIL_PASS
} = process.env;
