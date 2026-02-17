import multer from "multer";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Universal dynamic upload + compression
 * Supports .single(), .array(), and .fields()
 */
export const dynamicUpload = (folderName, fieldNames) => {
  const storage = multer.memoryStorage();

  const upload = multer({
    storage,
    limits: {
      fileSize: 50 * 1024 * 1024 // 50 MB max (will be validated per file type)
    },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm', '.m4v'];
      const isVideo = videoExtensions.includes(ext);

      // Videos: 50MB, Others: 15MB
      const maxSize = isVideo ? 50 * 1024 * 1024 : 15 * 1024 * 1024;

      // Store the limit for later validation
      if (!req.fileSizeLimits) req.fileSizeLimits = {};
      req.fileSizeLimits[file.fieldname] = maxSize;

      cb(null, true);
    }
  });

  const handleUpload = async (req, res, next) => {
    try {
      const uploadPath = path.join(process.cwd(), `uploads/${folderName}`);
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      // 🧠 Helper function to compress and save one file
      const processFile = async (file) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm', '.m4v'];
        const isVideo = videoExtensions.includes(ext);

        // Validate file size based on type
        const maxSize = isVideo ? 50 * 1024 * 1024 : 15 * 1024 * 1024;
        if (file.size > maxSize) {
          const maxSizeMB = isVideo ? 50 : 15;
          throw new Error(`File ${file.originalname} exceeds ${maxSizeMB}MB limit`);
        }

        const random = Math.random().toString(36).substring(2, 8);
        const filename = `${file.fieldname}-${Date.now()}-${random}${ext}`;
        const filepath = path.join(uploadPath, filename);

        // Skip non-images (including videos)
        if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
          fs.writeFileSync(filepath, file.buffer);
          return { ...file, filename, path: filepath };
        }

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
        }

        const compressedBuffer = await sharpInstance.toBuffer();
        fs.writeFileSync(filepath, compressedBuffer);

        return { ...file, filename, path: filepath };
      };

      // 🧩 Normalize multer’s file structure
      let files = [];

      if (req.file) {
        // upload.single()
        files = [req.file];
      } else if (Array.isArray(req.files)) {
        // upload.array()
        files = req.files;
      } else if (typeof req.files === "object" && Object.keys(req.files).length > 0) {
        // upload.fields()
        files = Object.values(req.files).flat();
      }

      // Process all uploaded files
      if (files.length > 0) {
        const processedResults = await Promise.all(files.map(processFile));

        // Reassign processed results back to req.files / req.file
        if (req.file) {
          req.file = processedResults[0];
        } else if (Array.isArray(req.files)) {
          req.files = processedResults;
        } else {
          // rebuild fields structure
          const grouped = {};
          for (const f of processedResults) {
            if (!grouped[f.fieldname]) grouped[f.fieldname] = [];
            grouped[f.fieldname].push(f);
          }
          req.files = grouped;
        }
      }

      console.log("✅ Upload + Compression done for:", folderName);
      next();
    } catch (err) {
      console.error("❌ Upload/Compression Error:", err);
      next(err);
    }
  };

  return { upload, handleUpload };
};
