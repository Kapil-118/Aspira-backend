const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "aspira/chat-files",
    resource_type: "raw",
  }),
});

module.exports = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});