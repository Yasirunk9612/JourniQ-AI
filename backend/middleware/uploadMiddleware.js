const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "journiq/hotels",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1800, height: 1200, crop: "limit", quality: "auto", fetch_format: "auto" }],
  },
});

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed."));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024, files: 15 },
});

module.exports = upload;
