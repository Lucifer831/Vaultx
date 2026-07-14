import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Link2, Ban } from "lucide-react";
import AdminLayout from "../Component/AdminLayout";
import { API_URL } from "../utils/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

export default function AdminShares() {
  const navigate = useNavigate();
  const [shares, setShares] = useState([]);
  const [actingId, setActingId] = useState(null);

  const fetchShares = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/admin/shares`, {
        headers: authHeaders(),
      });

      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
        return;
      }

      const result = await response.json();
      if (response.ok) setShares(result.shares);
      else toast.error(result.message || "Could not load active links");
    } catch (error) {
      console.log(error);
      toast.error("Could not load active links");
    }
  }, [navigate]);

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  const handleRevoke = async (id) => {
    setActingId(id);
    try {
      const response = await fetch(`${API_URL}/admin/shares/${id}/revoke`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || "Action failed");
        return;
      }

      toast.success(result.message);
      fetchShares();
    } catch (error) {
      console.log(error);
      toast.error("Could not connect to the server");
    } finally {
      setActingId(null);
    }
  };

  return (
    <AdminLayout title="Share Links" subtitle="Every active share link across all users">
      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
              <Link2 size={16} className="text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Active Share Links</h2>
          </div>
          <span
            className={`text-sm flex items-center gap-1.5 ${
              shares.length > 0 ? "text-emerald-400 font-semibold" : "text-gray-500"
            }`}
          >
            {shares.length > 0 && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            {shares.length} active
          </span>
        </div>

        {shares.length === 0 ? (
          <p className="text-gray-500 text-sm px-6 py-10 text-center">
            No active share links right now
          </p>
        ) : (
          <div className="divide-y divide-white/10">
            {shares.map((share) => (
              <div key={share.id} className="flex items-center justify-between px-6 py-4">
                <div className="min-w-0">
                  <p className="text-white font-semibold">
                    {share.owner ? share.owner.fullname : "Unknown user"}
                    <span className="text-gray-500 font-normal"> — {share.owner?.email}</span>
                  </p>
                  <p className="text-gray-400 text-sm truncate">{share.originalName}</p>
                  <p className="text-[#8b7bff] text-xs flex items-center gap-1 mt-1 truncate">
                    <Link2 size={12} />
                    {share.shareUrl}
                  </p>
                </div>
                <button
                  disabled={actingId === share.id}
                  onClick={() => handleRevoke(share.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition disabled:opacity-50 shrink-0 ml-4"
                >
                  <Ban size={16} /> Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
