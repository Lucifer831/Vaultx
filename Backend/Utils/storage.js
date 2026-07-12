const fs = require("fs");
const path = require("path");

const uploadsDir = path.join(__dirname, "..", "uploads");
const trashDir = path.join(__dirname, "..", "trash");

// 1GB total storage limit per user (uploads + trash, since trashed files
// still occupy disk space until they're permanently deleted).
const STORAGE_LIMIT_BYTES = 1 * 1024 * 1024 * 1024;

const IGNORED_ENTRIES = [".gitkeep", ".DS_Store"];

const getDirSize = (dirPath) => {
  if (!fs.existsSync(dirPath)) return 0;

  return fs.readdirSync(dirPath).reduce((total, entry) => {
    if (IGNORED_ENTRIES.includes(entry)) return total;

    const entryPath = path.join(dirPath, entry);
    try {
      const stats = fs.statSync(entryPath);
      return stats.isFile() ? total + stats.size : total;
    } catch (err) {
      return total;
    }
  }, 0);
};

// Returns each user's private uploads folder, creating it if needed.
const getUserUploadsDir = (userId) => {
  const dir = path.join(uploadsDir, String(userId));
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

// Returns each user's private trash folder, creating it if needed.
const getUserTrashDir = (userId) => {
  const dir = path.join(trashDir, String(userId));
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const getUserUsage = (userId) => {
  const userUploadsDir = path.join(uploadsDir, String(userId));
  const userTrashDir = path.join(trashDir, String(userId));
  return getDirSize(userUploadsDir) + getDirSize(userTrashDir);
};

const getUserStorageInfo = (userId) => {
  const used = getUserUsage(userId);
  const limit = STORAGE_LIMIT_BYTES;
  const remaining = Math.max(limit - used, 0);
  const percentUsed = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

  return { used, limit, remaining, percentUsed };
};

module.exports = {
  uploadsDir,
  trashDir,
  STORAGE_LIMIT_BYTES,
  getDirSize,
  getUserUploadsDir,
  getUserTrashDir,
  getUserUsage,
  getUserStorageInfo,
};
