const { getUserUsage, STORAGE_LIMIT_BYTES } = require("../Utils/storage.js");

// Runs BEFORE multer touches the upload, so an over-limit upload is
// rejected immediately instead of writing the file to disk and then
// deleting it.
const checkStorageLimit = (req, res, next) => {
  try {
    const incomingSize = Number(req.headers["content-length"]) || 0;
    const currentUsage = getUserUsage(req.user.id);

    if (currentUsage + incomingSize > STORAGE_LIMIT_BYTES) {
      const remaining = Math.max(STORAGE_LIMIT_BYTES - currentUsage, 0);
      return res.status(413).json({
        message: `Storage limit reached. You only have ${(remaining / (1024 * 1024)).toFixed(
          1
        )} MB left of your 1GB limit.`,
        used: currentUsage,
        limit: STORAGE_LIMIT_BYTES,
        remaining,
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: "Unable to verify storage limit" });
  }
};

module.exports = checkStorageLimit;
