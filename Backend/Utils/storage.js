const { supabase, BUCKET } = require("./supabase.js");

const STORAGE_LIMIT_BYTES = 1 * 1024 * 1024 * 1024;

const IGNORED_ENTRIES = [".gitkeep", ".DS_Store"];

// Path helpers — files now live inside the Supabase "vault-x" bucket instead of local disk.
// Active files:  {userId}/{fileName}
// Trashed files: {userId}/trash/{fileName}
const getUserUploadsPrefix = (userId) => `${userId}`;
const getUserTrashPrefix = (userId) => `${userId}/trash`;

// Lists files (not sub-folders) directly under a prefix.
const listFiles = async (prefix) => {
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
    limit: 1000,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) throw error;

  return (data || []).filter(
    (entry) => entry.id !== null && !IGNORED_ENTRIES.includes(entry.name)
  );
};

const getPrefixSize = async (prefix) => {
  const files = await listFiles(prefix);
  return files.reduce((total, f) => total + (f.metadata?.size || 0), 0);
};

const getUserUsage = async (userId) => {
  const uploadsSize = await getPrefixSize(getUserUploadsPrefix(userId));
  const trashSize = await getPrefixSize(getUserTrashPrefix(userId));
  return uploadsSize + trashSize;
};

const getUserStorageInfo = async (userId) => {
  const used = await getUserUsage(userId);
  const limit = STORAGE_LIMIT_BYTES;
  const remaining = Math.max(limit - used, 0);
  const percentUsed = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

  return { used, limit, remaining, percentUsed };
};

// Permanently removes every file a user has in Supabase Storage — both
// their active uploads and anything sitting in their trash. Used when an
// account is deleted (admin action or approved self-deletion request).
const deleteUserFiles = async (userId) => {
  const prefixes = [getUserUploadsPrefix(userId), getUserTrashPrefix(userId)];

  for (const prefix of prefixes) {
    const files = await listFiles(prefix);
    if (!files.length) continue;

    const paths = files.map((f) => `${prefix}/${f.name}`);
    const { error } = await supabase.storage.from(BUCKET).remove(paths);
    if (error) throw error;
  }
};

module.exports = {
  BUCKET,
  STORAGE_LIMIT_BYTES,
  getUserUploadsPrefix,
  getUserTrashPrefix,
  listFiles,
  getUserUsage,
  getUserStorageInfo,
  deleteUserFiles,
};
