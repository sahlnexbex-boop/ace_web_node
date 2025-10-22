import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "../config/env.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: EMAIL_USER, pass: EMAIL_PASS }
});

export default async function sendEmail(to, subject, html) {
  await transporter.sendMail({ from: EMAIL_USER, to, subject, html });
}
