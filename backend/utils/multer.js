const multer = require("multer");

// Use memory storage for Cloudinary (required for upload_stream)
const storage = multer.memoryStorage();

// Allowed MIME types for ALL uploads
const allowedTypes = [
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",

  // Videos
  "video/mp4",
  "video/quicktime",
  "video/webm",

  // Audio formats
  "audio/mpeg",
  "audio/mp3",
  "audio/ogg",
  "audio/wav",

  // ⭐ Required for Chrome voice recordings
  "audio/webm"
];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
});
