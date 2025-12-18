import fs from "fs";
import path from "path";

export const deleteFile = (filePath) => {
  if (!filePath) return;

  let localPath = filePath;
  if (filePath.startsWith("http")) {
    const url = new URL(filePath);
    localPath = url.pathname;
  }

  localPath = localPath.replace(/^\/+/, "");
  const absolutePath = path.join(process.cwd(), localPath);

  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
};
