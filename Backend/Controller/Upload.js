const multer = require("multer");
const { supabase, BUCKET } = require("../Utils/supabase.js");
const { getUserUploadsPrefix } = require("../Utils/storage.js");
const { createNotification } = require("../Utils/notify.js");

// Files now go into memory first, then get pushed to Supabase Storage.
// Nothing gets written to the laptop's disk anymore.
const upload = multer({ storage: multer.memoryStorage() });

// Supabase Storage keys reject spaces, unicode whitespace (e.g. the narrow
// no-break space macOS puts in screenshot filenames like "2.46.07\u202fPM"),
// and other special characters. This strips the name down to a safe subset
// while keeping it readable and preserving the file extension.
const sanitizeFileName = (originalName) => {
  const lastDot = originalName.lastIndexOf(".");
  const hasExt = lastDot > 0 && lastDot < originalName.length - 1;
  const base = hasExt ? originalName.slice(0, lastDot) : originalName;
  const ext = hasExt ? originalName.slice(lastDot + 1) : "";

  const cleanBase = base
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "_") // anything that's not a-z A-Z 0-9 _ . - becomes _
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "") || "file";

  const cleanExt = ext.replace(/[^\w]+/g, "");

  return cleanExt ? `${cleanBase}.${cleanExt}` : cleanBase;
};

const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const safeName = sanitizeFileName(req.file.originalname);
    const fileName = `${Date.now()}-${safeName}`;
    const filePath = `${getUserUploadsPrefix(req.user.id)}/${fileName}`;

    const { error } = await supabase.storage.from(BUCKET).upload(filePath, req.file.buffer, {
      contentType: req.file.mimetype || "application/octet-stream",
      upsert: false,
    });

    if (error) {
      console.log(error);
      // TEMP DEBUG: surfacing real error details in the response so it shows up
      // in the browser Network tab. Remove this once the issue is fixed.
      return res.status(500).json({
        message: "Unable to upload file to Supabase",
        debug: {
          message: error.message,
          statusCode: error.statusCode,
          error: error.error,
          name: error.name,
          cause: error.cause,
        },
      });
    }

    createNotification(req.user.id, `"${req.file.originalname}" was uploaded`, "upload");

    res.status(200).json({
      message: "File uploaded successfully",
      file: {
        fileName,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Unable to upload file" });
  }
};

module.exports = { upload, uploadFile };
