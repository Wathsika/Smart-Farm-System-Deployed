import multer from "multer";

//  Use memory storage for Cloudinary uploads
const storage = multer.memoryStorage();

//  Only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Export middleware
export const upload = multer({ storage, fileFilter });
