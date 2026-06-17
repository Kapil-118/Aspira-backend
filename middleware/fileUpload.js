const multer = require("multer");
const path = require("path");
const fs = require("fs");
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const allowedTypes = [
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
  ".txt",
  ".zip",
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);

  if (allowedTypes.includes(ext.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"));
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
