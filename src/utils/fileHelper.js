import fs from "fs";
import path from "path";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

export const deleteFile = (filePath) => {
  if (!filePath) return;
  const localPath = path.join(process.cwd(), filePath.replace(SERVER_URL, "."));
  if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
};
