import multer from "multer";
import fs from "fs";
import path from "path";
import sharp from "sharp";
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

  const upload = multer({ storage });

  // Middleware wrapper for compression
  const compressFile = async (req, res, next) => {
    if (!req.file) return next();

    const filePath = req.file.path;
    const ext = path.extname(filePath).toLowerCase();

    try {
      if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        const compressedPath = filePath.replace(ext, `.compressed${ext}`);

        await sharp(filePath)
          .jpeg({ quality: 85 }) // adjust 80–90 for optimal balance
          .png({ compressionLevel: 8 })
          .toFile(compressedPath);

        // Replace original with compressed
        fs.renameSync(compressedPath, filePath);
      }

      // For PDFs or other formats: skip compression
      next();
    } catch (error) {
      console.error("File compression error:", error);
      next();
    }
  };

  return { upload, compressFile };
};
