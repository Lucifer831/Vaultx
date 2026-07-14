import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderPlus, HardDrive, Database, FileText, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { formatStorage } from "../utils/format";
import { API_URL } from "../utils/api";

export default function DashboardStats() {
  const navigate = useNavigate();
  const [storageInfo, setStorageInfo] = useState(null);
  const [filesCount, setFilesCount] = useState(0);
  const [trashCount, setTrashCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const token = () => localStorage.getItem("token");

  const fetchStats = useCallback(async () => {
    try {
      const [storageRes, filesRes, trashRes] = await Promise.all([
        fetch(`${API_URL}/storage`, {
          headers: { Authorization: `Bearer ${token()}` },
        }),
        fetch(`${API_URL}/files`, {
          headers: { Authorization: `Bearer ${token()}` },
        }),
        fetch(`${API_URL}/trash`, {
          headers: { Authorization: `Bearer ${token()}` },
        }),
      ]);

      const storageData = await storageRes.json();
      const filesData = await filesRes.json();
      const trashData = await trashRes.json();

      if (storageRes.ok) setStorageInfo(storageData);
      if (filesRes.ok) setFilesCount((filesData.files || []).length);
      if (trashRes.ok) setTrashCount((trashData.files || []).length);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // stay live: refresh whenever a file is uploaded, deleted, restored,
    // renamed, starred, or permanently removed anywhere in the app.
    window.addEventListener("file-uploaded", fetchStats);
    window.addEventListener("storage-changed", fetchStats);
    return () => {
      window.removeEventListener("file-uploaded", fetchStats);
      window.removeEventListener("storage-changed", fetchStats);
    };
  }, [fetchStats]);

  const handleNewBucket = () => {
    navigate("/new-bucket");
  };

  const percent = storageInfo ? Math.round(Math.min(storageInfo.percentUsed, 100)) : 0;

  return (
    <div className="px-8 pt-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-white text-4xl font-bold">
            Welcome back, {user?.fullname ? user.fullname.split(" ")[0] : "there"}
          </h1>
          <p className="text-white/40 mt-2">
            Signed in as <span className="font-mono">{user?.email}</span>
          </p>
        </div>

        <button
          onClick={handleNewBucket}
          className="flex items-center gap-2 bg-[#1c1b1c] border border-white/10 text-white px-5 py-3 rounded-xl font-semibold hover:bg-white/10 transition"
        >
          <FolderPlus size={18} />
          New bucket
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#19191a] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-[#6245F5]/15 flex items-center justify-center shrink-0">
              <HardDrive size={16} className="text-[#8b7cf6]" />
            </div>
            <span className="text-white/40 text-xs font-semibold tracking-wide">STORAGE USED</span>
          </div>
          <div className="text-white text-3xl font-bold">{loading ? "..." : `${percent}%`}</div>
          <div className="text-white/40 text-sm mt-2">
            {loading || !storageInfo
              ? ""
              : `${formatStorage(storageInfo.used)} of ${formatStorage(storageInfo.limit)}`}
          </div>
        </div>

        <div className="bg-[#19191a] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
              <Database size={16} className="text-emerald-400" />
            </div>
            <span className="text-white/40 text-xs font-semibold tracking-wide">BUCKETS</span>
          </div>
          <div className="text-white text-3xl font-bold">1</div>
          <div className="text-white/40 text-sm mt-2">All active</div>
        </div>

        <div className="bg-[#19191a] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
              <FileText size={16} className="text-violet-400" />
            </div>
            <span className="text-white/40 text-xs font-semibold tracking-wide">FILES</span>
          </div>
          <div className="text-white text-3xl font-bold">{loading ? "..." : filesCount}</div>
          <div className="text-white/40 text-sm mt-2">across 1 bucket</div>
        </div>

        <div className="bg-[#19191a] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
              <Trash2 size={16} className="text-red-400" />
            </div>
            <span className="text-white/40 text-xs font-semibold tracking-wide">TRASH</span>
          </div>
          <div className="text-white text-3xl font-bold">{loading ? "..." : trashCount}</div>
          <div className="text-white/40 text-sm mt-2">
            {trashCount === 0 ? "Nothing to purge" : `${trashCount} item${trashCount > 1 ? "s" : ""}`}
          </div>
        </div>
      </div>
    </div>
  );
}
