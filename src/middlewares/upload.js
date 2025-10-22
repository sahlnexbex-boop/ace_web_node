import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const dynamicUpload = (folderName, fieldName) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), `uploads/${folderName}`);
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const random = Math.random().toString(36).substring(2, 8);
      cb(null, `${fieldName}-${Date.now()}-${random}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (!file.originalname) {
      return cb(new Error("File not valid"), false);
    }
    cb(null, true);
  };

  return multer({ storage, fileFilter });
};
