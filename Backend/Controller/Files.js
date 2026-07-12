const fs = require("fs");
const path = require("path");
const {
  getUserUploadsDir,
  getUserTrashDir,
  getUserStorageInfo,
} = require("../Utils/storage.js");

const starredFilePath = path.join(__dirname, "..", "starred.json");
const trashMetaPath = path.join(__dirname, "..", "trash-meta.json");


const readStarred = () => {
  try {
    if (!fs.existsSync(starredFilePath)) return [];
    const raw = fs.readFileSync(starredFilePath, "utf-8");
    return JSON.parse(raw || "[]");
  } catch (err) {
    return [];
  }
};

const writeStarred = (list) => {
  fs.writeFileSync(starredFilePath, JSON.stringify(list, null, 2));
};


const readTrashMeta = () => {
  try {
    if (!fs.existsSync(trashMetaPath)) return {};
    const raw = fs.readFileSync(trashMetaPath, "utf-8");
    return JSON.parse(raw || "{}");
  } catch (err) {
    return {};
  }
};

const writeTrashMeta = (meta) => {
  fs.writeFileSync(trashMetaPath, JSON.stringify(meta, null, 2));
};

const getOriginalName = (fileName) => {
  const dashIndex = fileName.indexOf("-");
  return dashIndex !== -1 ? fileName.slice(dashIndex + 1) : fileName;
};

const getFiles = (req, res) => {
  const uploadsDir = getUserUploadsDir(req.user.id);

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Unable to read uploads folder" });
    }

    const starredList = readStarred();

    const fileList = files
      .filter((file) => file !== ".gitkeep" && file !== ".DS_Store")
      .map((file) => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);

        return {
          fileName: file,
          originalName: getOriginalName(file),
          size: stats.size,
          lastModified: stats.mtime,
          starred: starredList.includes(file),
        };
      })
      .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    res.status(200).json({ files: fileList });
  });
};

// Soft delete: move the file from uploads/ into trash/
const deleteFile = (req, res) => {
  const uploadsDir = getUserUploadsDir(req.user.id);
  const trashDir = getUserTrashDir(req.user.id);

  const { fileName } = req.params;
  const safeName = path.basename(fileName);
  const oldPath = path.join(uploadsDir, safeName);
  const newPath = path.join(trashDir, safeName);

  if (!oldPath.startsWith(uploadsDir) || !newPath.startsWith(trashDir)) {
    return res.status(400).json({ message: "Invalid file name" });
  }

  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      if (err.code === "ENOENT") {
        return res.status(404).json({ message: "File not found" });
      }
      return res.status(500).json({ message: "Unable to delete file" });
    }

    // remove from starred (a trashed file shouldn't show up as starred)
    const starredList = readStarred().filter((name) => name !== safeName);
    writeStarred(starredList);

    // record when it was trashed
    const meta = readTrashMeta();
    meta[safeName] = new Date().toISOString();
    writeTrashMeta(meta);

    res.status(200).json({ message: "File moved to trash" });
  });
};

const renameFile = (req, res) => {
  const uploadsDir = getUserUploadsDir(req.user.id);

  const { fileName } = req.params;
  const { newName } = req.body;

  if (!newName || !newName.trim()) {
    return res.status(400).json({ message: "New name is required" });
  }

  const safeOldName = path.basename(fileName);
  const oldPath = path.join(uploadsDir, safeOldName);

  if (!oldPath.startsWith(uploadsDir)) {
    return res.status(400).json({ message: "Invalid file name" });
  }

  if (!fs.existsSync(oldPath)) {
    return res.status(404).json({ message: "File not found" });
  }

  const dashIndex = safeOldName.indexOf("-");
  const timestamp = dashIndex !== -1 ? safeOldName.slice(0, dashIndex) : Date.now().toString();

  const safeNewOriginalName = path.basename(newName.trim());
  const newFileName = `${timestamp}-${safeNewOriginalName}`;
  const newPath = path.join(uploadsDir, newFileName);

  if (!newPath.startsWith(uploadsDir)) {
    return res.status(400).json({ message: "Invalid new name" });
  }

  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      return res.status(500).json({ message: "Unable to rename file" });
    }

    const starredList = readStarred();
    const idx = starredList.indexOf(safeOldName);
    if (idx !== -1) {
      starredList[idx] = newFileName;
      writeStarred(starredList);
    }

    res.status(200).json({
      message: "File renamed successfully",
      fileName: newFileName,
      originalName: safeNewOriginalName,
    });
  });
};

const toggleStar = (req, res) => {
  const uploadsDir = getUserUploadsDir(req.user.id);

  const { fileName } = req.params;
  const safeName = path.basename(fileName);
  const filePath = path.join(uploadsDir, safeName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }

  const starredList = readStarred();
  const idx = starredList.indexOf(safeName);
  let starred;

  if (idx !== -1) {
    starredList.splice(idx, 1);
    starred = false;
  } else {
    starredList.push(safeName);
    starred = true;
  }

  writeStarred(starredList);

  res.status(200).json({ message: "Updated", starred });
};



const getTrashFiles = (req, res) => {
  const trashDir = getUserTrashDir(req.user.id);

  fs.readdir(trashDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Unable to read trash folder" });
    }

    const meta = readTrashMeta();

    const fileList = files
      .filter((file) => file !== ".gitkeep" && file !== ".DS_Store")
      .map((file) => {
        const filePath = path.join(trashDir, file);
        const stats = fs.statSync(filePath);

        return {
          fileName: file,
          originalName: getOriginalName(file),
          size: stats.size,
          deletedAt: meta[file] || stats.mtime,
        };
      })
      .sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));

    res.status(200).json({ files: fileList });
  });
};

const restoreFile = (req, res) => {
  const uploadsDir = getUserUploadsDir(req.user.id);
  const trashDir = getUserTrashDir(req.user.id);

  const { fileName } = req.params;
  const safeName = path.basename(fileName);
  const oldPath = path.join(trashDir, safeName);
  const newPath = path.join(uploadsDir, safeName);

  if (!oldPath.startsWith(trashDir) || !newPath.startsWith(uploadsDir)) {
    return res.status(400).json({ message: "Invalid file name" });
  }

  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      if (err.code === "ENOENT") {
        return res.status(404).json({ message: "File not found in trash" });
      }
      return res.status(500).json({ message: "Unable to restore file" });
    }

    const meta = readTrashMeta();
    delete meta[safeName];
    writeTrashMeta(meta);

    res.status(200).json({ message: "File restored" });
  });
};

const permanentlyDeleteFile = (req, res) => {
  const trashDir = getUserTrashDir(req.user.id);

  const { fileName } = req.params;
  const safeName = path.basename(fileName);
  const filePath = path.join(trashDir, safeName);

  if (!filePath.startsWith(trashDir)) {
    return res.status(400).json({ message: "Invalid file name" });
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      if (err.code === "ENOENT") {
        return res.status(404).json({ message: "File not found in trash" });
      }
      return res.status(500).json({ message: "Unable to delete file" });
    }

    const meta = readTrashMeta();
    delete meta[safeName];
    writeTrashMeta(meta);

    res.status(200).json({ message: "File permanently deleted" });
  });
};


const getStorageInfo = (req, res) => {
  const info = getUserStorageInfo(req.user.id);
  res.status(200).json(info);
};

module.exports = {
  getFiles,
  deleteFile,
  renameFile,
  toggleStar,
  getTrashFiles,
  restoreFile,
  permanentlyDeleteFile,
  getStorageInfo,
};
