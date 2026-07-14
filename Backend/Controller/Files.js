const fs = require("fs");
const path = require("path");
const { supabase, BUCKET } = require("../Utils/supabase.js");
const {
  getUserUploadsPrefix,
  getUserTrashPrefix,
  listFiles,
  getUserStorageInfo,
} = require("../Utils/storage.js");
const Share = require("../Database/Share.js");
const { createNotification } = require("../Utils/notify.js");

const starredFilePath = path.join(__dirname, "..", "starred.json");
const trashMetaPath = path.join(__dirname, "..", "trash-meta.json");

const isNotFoundError = (error) =>
  !!error && typeof error.message === "string" && error.message.toLowerCase().includes("not found");

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

const getFiles = async (req, res) => {
  try {
    const prefix = getUserUploadsPrefix(req.user.id);
    const files = await listFiles(prefix);
    const starredList = readStarred();

    const fileList = files
      .map((f) => ({
        fileName: f.name,
        originalName: getOriginalName(f.name),
        size: f.metadata?.size || 0,
        lastModified: f.updated_at || f.created_at || new Date().toISOString(),
        starred: starredList.includes(f.name),
      }))
      .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    res.status(200).json({ files: fileList });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Unable to read uploads folder" });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { fileName } = req.params;
    const safeName = path.basename(fileName);

    const oldPath = `${getUserUploadsPrefix(req.user.id)}/${safeName}`;
    const newPath = `${getUserTrashPrefix(req.user.id)}/${safeName}`;

    const { error } = await supabase.storage.from(BUCKET).move(oldPath, newPath);

    if (error) {
      if (isNotFoundError(error)) {
        return res.status(404).json({ message: "File not found" });
      }
      console.log(error);
      return res.status(500).json({ message: "Unable to delete file" });
    }

    const starredList = readStarred().filter((name) => name !== safeName);
    writeStarred(starredList);

    const meta = readTrashMeta();
    meta[safeName] = new Date().toISOString();
    writeTrashMeta(meta);

    Share.updateMany({ user: req.user.id, fileName: safeName }, { active: false }).catch((err2) =>
      console.log(err2)
    );

    createNotification(req.user.id, `"${getOriginalName(safeName)}" was moved to trash`, "delete");

    res.status(200).json({ message: "File moved to trash" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Unable to delete file" });
  }
};

const renameFile = async (req, res) => {
  try {
    const { fileName } = req.params;
    const { newName } = req.body;

    if (!newName || !newName.trim()) {
      return res.status(400).json({ message: "New name is required" });
    }

    const safeOldName = path.basename(fileName);
    const dashIndex = safeOldName.indexOf("-");
    const timestamp = dashIndex !== -1 ? safeOldName.slice(0, dashIndex) : Date.now().toString();

    const safeNewOriginalName = path.basename(newName.trim());
    const newFileName = `${timestamp}-${safeNewOriginalName}`;

    const prefix = getUserUploadsPrefix(req.user.id);
    const oldPath = `${prefix}/${safeOldName}`;
    const newPath = `${prefix}/${newFileName}`;

    const { error } = await supabase.storage.from(BUCKET).move(oldPath, newPath);

    if (error) {
      if (isNotFoundError(error)) {
        return res.status(404).json({ message: "File not found" });
      }
      console.log(error);
      return res.status(500).json({ message: "Unable to rename file" });
    }

    const starredList = readStarred();
    const idx = starredList.indexOf(safeOldName);
    if (idx !== -1) {
      starredList[idx] = newFileName;
      writeStarred(starredList);
    }

    Share.updateMany(
      { user: req.user.id, fileName: safeOldName },
      { fileName: newFileName, originalName: safeNewOriginalName }
    ).catch((err2) => console.log(err2));

    res.status(200).json({
      message: "File renamed successfully",
      fileName: newFileName,
      originalName: safeNewOriginalName,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Unable to rename file" });
  }
};

const toggleStar = async (req, res) => {
  const { fileName } = req.params;
  const safeName = path.basename(fileName);

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

const getTrashFiles = async (req, res) => {
  try {
    const prefix = getUserTrashPrefix(req.user.id);
    const files = await listFiles(prefix);
    const meta = readTrashMeta();

    const fileList = files
      .map((f) => ({
        fileName: f.name,
        originalName: getOriginalName(f.name),
        size: f.metadata?.size || 0,
        deletedAt: meta[f.name] || f.updated_at || f.created_at || new Date().toISOString(),
      }))
      .sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));

    res.status(200).json({ files: fileList });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Unable to read trash folder" });
  }
};

const restoreFile = async (req, res) => {
  try {
    const { fileName } = req.params;
    const safeName = path.basename(fileName);

    const oldPath = `${getUserTrashPrefix(req.user.id)}/${safeName}`;
    const newPath = `${getUserUploadsPrefix(req.user.id)}/${safeName}`;

    const { error } = await supabase.storage.from(BUCKET).move(oldPath, newPath);

    if (error) {
      if (isNotFoundError(error)) {
        return res.status(404).json({ message: "File not found in trash" });
      }
      console.log(error);
      return res.status(500).json({ message: "Unable to restore file" });
    }

    const meta = readTrashMeta();
    delete meta[safeName];
    writeTrashMeta(meta);

    createNotification(req.user.id, `"${getOriginalName(safeName)}" was restored`, "restore");

    res.status(200).json({ message: "File restored" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Unable to restore file" });
  }
};

const permanentlyDeleteFile = async (req, res) => {
  try {
    const { fileName } = req.params;
    const safeName = path.basename(fileName);
    const filePath = `${getUserTrashPrefix(req.user.id)}/${safeName}`;

    const { error } = await supabase.storage.from(BUCKET).remove([filePath]);

    if (error) {
      console.log(error);
      return res.status(500).json({ message: "Unable to delete file" });
    }

    const meta = readTrashMeta();
    delete meta[safeName];
    writeTrashMeta(meta);

    Share.deleteMany({ user: req.user.id, fileName: safeName }).catch((err2) => console.log(err2));

    createNotification(
      req.user.id,
      `"${getOriginalName(safeName)}" was permanently deleted`,
      "permanent-delete"
    );

    res.status(200).json({ message: "File permanently deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Unable to delete file" });
  }
};

const getStorageInfo = async (req, res) => {
  try {
    const info = await getUserStorageInfo(req.user.id);
    res.status(200).json(info);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Unable to get storage info" });
  }
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
