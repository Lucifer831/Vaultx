const multer = require("multer");
const { getUserUploadsDir } = require("../Utils/storage.js");

// Storage config — each user gets their own folder so usage/quota can be
// tracked per user instead of globally.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userDir = getUserUploadsDir(req.user.id);
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Controller function that runs AFTER multer parses the file
const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.status(200).json({
    message: "File uploaded successfully",
    file: req.file,
  });
};

module.exports = { upload, uploadFile };
