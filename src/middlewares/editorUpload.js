import multer from "multer";
import path from "path";
import fs from "fs";

const editorStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/blogs/editor";
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `editor-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  },
});

export const editorUpload = multer({
  storage: editorStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only image files (JPEG, PNG, GIF, WebP) are allowed"));
    }
    cb(null, true);
  },
  limits: { 
    fileSize: 5 * 1024 * 1024 
  },
});