import React, { useCallback, useEffect, useState } from "react";
import { PieChart } from "lucide-react";
import { formatStorage } from "../utils/format";
import { API_URL } from "../utils/api";

export default function StorageBar() {
  const [info, setInfo] = useState(null);

  const fetchStorage = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/storage`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok) setInfo(result);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchStorage();
    // Refresh live whenever a file is uploaded, deleted, restored, or
    // permanently removed — anything that changes how much space is used.
    window.addEventListener("file-uploaded", fetchStorage);
    window.addEventListener("storage-changed", fetchStorage);
    return () => {
      window.removeEventListener("file-uploaded", fetchStorage);
      window.removeEventListener("storage-changed", fetchStorage);
    };
  }, [fetchStorage]);

  if (!info) return null;

  const percent = Math.min(info.percentUsed, 100);
  const nearFull = percent >= 90;

  return (
    <div className="mx-6 mt-6 p-5 rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center gap-2 text-white text-sm font-semibold">
        <PieChart size={18} className="text-[#6245F5]" />
        <span>Storage</span>
      </div>

      <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            nearFull ? "bg-red-500" : "bg-[#6245F5]"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-3 text-white/60 text-xs">
        {formatStorage(info.used)} of {formatStorage(info.limit)} used
      </div>
    </div>
  );
}
