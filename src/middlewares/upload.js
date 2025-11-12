import multer from "multer";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🧠 Create upload handler (in-memory -> compress -> save)
export const dynamicUpload = (folderName, fieldName) => {
  // Use memory storage (no disk write yet)
  const storage = multer.memoryStorage();
  const upload = multer({ storage });

  // Single middleware that handles upload + compression
  const handleUpload = async (req, res, next) => {
    const file = req.file;
    if (!file) return next();

    try {
      // Ensure upload directory exists
      const uploadPath = path.join(process.cwd(), `uploads/${folderName}`);
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      // Get original extension
      const ext = path.extname(file.originalname).toLowerCase();
      const random = Math.random().toString(36).substring(2, 8);
      const filename = `${fieldName}-${Date.now()}-${random}${ext}`;
      const filepath = path.join(uploadPath, filename);

      // Compress image (based on file type)
      let sharpInstance = sharp(file.buffer);
      switch (ext) {
        case ".jpg":
        case ".jpeg":
          sharpInstance = sharpInstance.jpeg({ quality: 85 });
          break;
        case ".png":
          sharpInstance = sharpInstance.png({ compressionLevel: 8 });
          break;
        case ".webp":
          sharpInstance = sharpInstance.webp({ quality: 85 });
          break;
        default:
          // Non-image (skip compression)
          fs.writeFileSync(filepath, file.buffer);
          req.file.path = filepath;
          return next();
      }

      // Write compressed buffer to file
      const outputBuffer = await sharpInstance.toBuffer();
      fs.writeFileSync(filepath, outputBuffer);

      // Attach to req.file (simulate multer disk storage)
      req.file.path = filepath;
      req.file.filename = filename;

      console.log("✅ File uploaded & compressed:", filename);
      next();
    } catch (err) {
      console.error("❌ Upload compression error:", err);
      next(err);
    }
  };

  return { upload, handleUpload };
};
