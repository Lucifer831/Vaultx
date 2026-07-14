// One-time script: pushes any files still sitting in the local ./uploads
// folder (from before the Supabase migration) up into Supabase Storage,
// then deletes the local copies. Safe to re-run — it skips anything that
// no longer exists locally.
//
// Run with:  node migrate-local-uploads-to-supabase.js

const fs = require("fs");
const path = require("path");
require("dotenv").config();

const { supabase, BUCKET } = require("./Utils/supabase.js");

const UPLOADS_ROOT = path.join(__dirname, "uploads");

const guessMimeType = (fileName) => {
  const ext = path.extname(fileName).toLowerCase();
  const map = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
    ".txt": "text/plain",
  };
  return map[ext] || "application/octet-stream";
};

const run = async () => {
  if (!fs.existsSync(UPLOADS_ROOT)) {
    console.log("No local uploads folder found — nothing to migrate ✅");
    return;
  }

  const userDirs = fs
    .readdirSync(UPLOADS_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  let migrated = 0;
  let failed = 0;

  for (const dir of userDirs) {
    const userId = dir.name;
    const userDirPath = path.join(UPLOADS_ROOT, userId);

    const files = fs
      .readdirSync(userDirPath, { withFileTypes: true })
      .filter((f) => f.isFile() && f.name !== ".DS_Store" && f.name !== ".gitkeep");

    for (const file of files) {
      const localPath = path.join(userDirPath, file.name);
      const remotePath = `${userId}/${file.name}`;

      try {
        const buffer = fs.readFileSync(localPath);

        const { error } = await supabase.storage.from(BUCKET).upload(remotePath, buffer, {
          contentType: guessMimeType(file.name),
          upsert: false,
        });

        if (error && !error.message?.toLowerCase().includes("already exists")) {
          throw error;
        }

        fs.unlinkSync(localPath);
        migrated += 1;
        console.log(`Migrated: ${remotePath}`);
      } catch (err) {
        failed += 1;
        console.log(`Failed: ${remotePath} —`, err.message || err);
      }
    }
  }

  console.log(`\nDone. Migrated ${migrated} file(s), ${failed} failure(s).`);
};

run();
