import React, { useEffect, useState, useRef } from "react";
import {
  FileText,
  Image as ImageIcon,
  Archive,
  File,
  SlidersHorizontal,
  MoreVertical,
  Pencil,
  Trash2,
  Star,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";

const getFileIcon = (name) => {
  const ext = name.split(".").pop().toLowerCase();

  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) {
    return { icon: ImageIcon, bg: "bg-[#7c3aed]", label: `${ext.toUpperCase()} Image` };
  }
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    return { icon: Archive, bg: "bg-[#4b5563]", label: "Archive" };
  }
  if (ext === "pdf") {
    return { icon: FileText, bg: "bg-[#ec4899]", label: "PDF Document" };
  }
  return { icon: File, bg: "bg-[#3b82f6]", label: `${ext.toUpperCase()} File` };
};

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

const viewTitles = {
  drive: "My Drive",
  recent: "Recent Files",
  starred: "Starred Files",
  trash: "Trash",
};

export default function Mainright({ activeView = "drive", searchQuery = "" }) {
  const [files, setFiles] = useState([]);
  const [trashFiles, setTrashFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const [renamingFile, setRenamingFile] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const menuRef = useRef(null);

  const token = () => localStorage.getItem("token");

  const fetchFiles = async () => {
    try {
      const response = await fetch("http://localhost:8080/files", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const result = await response.json();
      if (response.ok) setFiles(result.files || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTrash = async () => {
    try {
      const response = await fetch("http://localhost:8080/trash", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const result = await response.json();
      if (response.ok) setTrashFiles(result.files || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchFiles(), fetchTrash()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    window.addEventListener("file-uploaded", fetchAll);
    return () => window.removeEventListener("file-uploaded", fetchAll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuFor(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // move a file to trash
  const handleDelete = async (fileName) => {
    setOpenMenuFor(null);
    const confirmed = window.confirm("Move this file to trash?");
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:8080/files/${encodeURIComponent(fileName)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const result = await response.json();

      if (response.ok) {
        toast.success("Moved to trash");
        setFiles((prev) => prev.filter((f) => f.fileName !== fileName));
        fetchTrash();
        window.dispatchEvent(new Event("storage-changed"));
      } else {
        toast.error(result.message || "Delete failed");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while deleting");
    }
  };

  // restore a file from trash back to My Drive
  const handleRestore = async (fileName) => {
    try {
      const response = await fetch(`http://localhost:8080/trash/${encodeURIComponent(fileName)}/restore`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const result = await response.json();

      if (response.ok) {
        toast.success("File restored");
        setTrashFiles((prev) => prev.filter((f) => f.fileName !== fileName));
        fetchFiles();
        window.dispatchEvent(new Event("storage-changed"));
      } else {
        toast.error(result.message || "Restore failed");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while restoring");
    }
  };

  // permanently delete a file that's already in trash
  const handlePermanentDelete = async (fileName) => {
    const confirmed = window.confirm("This will permanently delete the file. Continue?");
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:8080/trash/${encodeURIComponent(fileName)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const result = await response.json();

      if (response.ok) {
        toast.success("File permanently deleted");
        setTrashFiles((prev) => prev.filter((f) => f.fileName !== fileName));
        window.dispatchEvent(new Event("storage-changed"));
      } else {
        toast.error(result.message || "Delete failed");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while deleting");
    }
  };

  const startRename = (file) => {
    setOpenMenuFor(null);
    setRenamingFile(file.fileName);
    setRenameValue(file.originalName);
  };

  const cancelRename = () => {
    setRenamingFile(null);
    setRenameValue("");
  };

  const confirmRename = async (fileName) => {
    if (!renameValue.trim()) {
      cancelRename();
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/files/${encodeURIComponent(fileName)}/rename`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ newName: renameValue.trim() }),
      });
      const result = await response.json();

      if (response.ok) {
        toast.success("File renamed");
        fetchFiles();
      } else {
        toast.error(result.message || "Rename failed");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while renaming");
    } finally {
      cancelRename();
    }
  };

  const handleToggleStar = async (fileName) => {
    try {
      const response = await fetch(`http://localhost:8080/files/${encodeURIComponent(fileName)}/star`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const result = await response.json();

      if (response.ok) {
        setFiles((prev) =>
          prev.map((f) => (f.fileName === fileName ? { ...f, starred: result.starred } : f))
        );
        toast.success(result.starred ? "Added to Starred" : "Removed from Starred");
      } else {
        toast.error(result.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while updating star");
    }
  };

  const visibleFiles = (() => {
    const base = activeView === "starred" ? files.filter((f) => f.starred) : files;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return base;
    return base.filter((f) => f.originalName.toLowerCase().includes(query));
  })();

  const visibleTrashFiles = (() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return trashFiles;
    return trashFiles.filter((f) => f.originalName.toLowerCase().includes(query));
  })();

  return (
    <div className="p-8">
      <div className="bg-[#19191a] rounded-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
          <h2 className="text-white text-2xl font-bold">{viewTitles[activeView]}</h2>
          {activeView === "recent" && (
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <span>Last 30 days</span>
              <SlidersHorizontal size={18} />
            </div>
          )}
          {activeView === "trash" && (
            <span className="text-white/40 text-sm">Items here can be restored or deleted forever</span>
          )}
        </div>

        {activeView === "trash" ? (
          <>
            {/* Column headers */}
            <div className="grid grid-cols-[2fr_1fr_1fr_90px] px-8 py-4 text-white/40 text-xs font-semibold tracking-wide">
              <span>NAME</span>
              <span>DELETED ON</span>
              <span>FILE SIZE</span>
              <span></span>
            </div>

            {loading ? (
              <div className="px-8 py-10 text-white/40 text-sm">Loading trash...</div>
            ) : visibleTrashFiles.length === 0 ? (
              <div className="px-8 py-10 text-white/40 text-sm">
                {searchQuery.trim() ? "No files match your search." : "Trash is empty."}
              </div>
            ) : (
              visibleTrashFiles.map((file) => {
                const { icon: Icon, bg, label } = getFileIcon(file.originalName);
                return (
                  <div
                    key={file.fileName}
                    className="grid grid-cols-[2fr_1fr_1fr_90px] items-center px-8 py-4 border-t border-white/5 hover:bg-white/5 transition"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0 opacity-60`}>
                        <Icon size={20} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-white text-sm font-semibold truncate">{file.originalName}</div>
                        <div className="text-white/40 text-xs">{label}</div>
                      </div>
                    </div>

                    <div className="text-white/70 text-sm">{formatDate(file.deletedAt)}</div>
                    <div className="text-white/70 text-sm">{formatSize(file.size)}</div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleRestore(file.fileName)}
                        title="Restore"
                        className="text-white/50 hover:text-green-400 transition"
                      >
                        <RotateCcw size={18} />
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(file.fileName)}
                        title="Delete forever"
                        className="text-white/50 hover:text-red-400 transition"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </>
        ) : (
          <>
            {/* Column headers */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_40px_40px] px-8 py-4 text-white/40 text-xs font-semibold tracking-wide">
              <span>NAME</span>
              <span>OWNER</span>
              <span>LAST MODIFIED</span>
              <span>FILE SIZE</span>
              <span></span>
              <span></span>
            </div>

            {loading ? (
              <div className="px-8 py-10 text-white/40 text-sm">Loading files...</div>
            ) : visibleFiles.length === 0 ? (
              <div className="px-8 py-10 text-white/40 text-sm">
                {searchQuery.trim()
                  ? "No files match your search."
                  : activeView === "starred"
                  ? "No starred files yet. Click the star on a file to add it here."
                  : 'No files yet. Click "New File" or "Upload" to get started.'}
              </div>
            ) : (
              visibleFiles.map((file) => {
                const { icon: Icon, bg, label } = getFileIcon(file.originalName);
                const isRenaming = renamingFile === file.fileName;

                return (
                  <div
                    key={file.fileName}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_40px_40px] items-center px-8 py-4 border-t border-white/5 hover:bg-white/5 transition relative"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                        <Icon size={20} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        {isRenaming ? (
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") confirmRename(file.fileName);
                              if (e.key === "Escape") cancelRename();
                            }}
                            onBlur={() => confirmRename(file.fileName)}
                            className="bg-[#0f0f10] text-white text-sm font-semibold px-2 py-1 rounded outline-none border border-[#6245F5] w-full"
                          />
                        ) : (
                          <div className="text-white text-sm font-semibold truncate">{file.originalName}</div>
                        )}
                        <div className="text-white/40 text-xs">{label}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-white text-sm">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] text-white">
                        ME
                      </div>
                      <span>Me</span>
                    </div>

                    <div className="text-white/70 text-sm">{formatDate(file.lastModified)}</div>
                    <div className="text-white/70 text-sm">{formatSize(file.size)}</div>

                    <button
                      onClick={() => handleToggleStar(file.fileName)}
                      className="text-white/40 hover:text-yellow-400 transition"
                      title={file.starred ? "Remove from Starred" : "Add to Starred"}
                    >
                      <Star size={18} className={file.starred ? "text-yellow-400" : ""} fill={file.starred ? "currentColor" : "none"} />
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuFor(openMenuFor === file.fileName ? null : file.fileName)}
                        className="text-white/40 hover:text-white transition"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenuFor === file.fileName && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-8 z-10 w-36 bg-[#242425] border border-white/10 rounded-xl shadow-lg overflow-hidden"
                        >
                          <button
                            onClick={() => startRename(file)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-white text-sm hover:bg-white/10 transition"
                          >
                            <Pencil size={14} />
                            Rename
                          </button>
                          <button
                            onClick={() => handleDelete(file.fileName)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400 text-sm hover:bg-white/10 transition"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}
