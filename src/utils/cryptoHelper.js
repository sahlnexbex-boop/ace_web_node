import crypto from "crypto";

const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update(String(process.env.CRYPTO_SECRET_KEY || "MyUltraStrongSecretKey123456789012"))
  .digest("base64")
  .substring(0, 32); 

const IV_LENGTH = 16;

export const encrypt = (text) => {
  if (!text) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return `${iv.toString("base64")}:${encrypted}`;
};

export const decrypt = (encryptedText) => {
  if (!encryptedText) return null;
  const [ivBase64, encryptedData] = encryptedText.split(":");
  const iv = Buffer.from(ivBase64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedData, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
