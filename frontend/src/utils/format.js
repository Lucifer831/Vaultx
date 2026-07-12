export const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

// Storage-bar friendly formatting: MB while small, GB once past 1024MB,
// with the extra decimal precision that a "X of Y used" label wants.
export const formatStorage = (bytes) => {
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb < 10 ? mb.toFixed(2) : Math.round(mb)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
};
