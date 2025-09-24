// backend/middlewares/upload.js
import multer from "multer";

// Use memory storage so files are kept in RAM, not on disk
const storage = multer.memoryStorage();

// Optional: restrict to images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

export const upload = multer({ storage, fileFilter });
