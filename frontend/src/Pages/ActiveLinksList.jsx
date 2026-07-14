import React, { useEffect, useState } from "react";
import { Link2, Copy, Ban, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";
import { API_URL } from "../utils/api";

const getFileIcon = (name) => {
  const ext = name.split(".").pop().toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return ImageIcon;
  return FileText;
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

export default function ActiveLinksList() {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState(null);

  const token = () => localStorage.getItem("token");

  const fetchShares = async () => {
    try {
      const response = await fetch(`${API_URL}/shares`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const result = await response.json();
      if (response.ok) setShares(result.shares || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShares();
    window.addEventListener("share-created", fetchShares);
    return () => window.removeEventListener("share-created", fetchShares);
  }, []);

  const handleCopy = async (shareUrl) => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    } catch (error) {
      console.log(error);
      toast.error("Could not copy link");
    }
  };

  const handleRevoke = async (id) => {
    const confirmed = window.confirm("Revoke this link? Anyone with the link will lose access.");
    if (!confirmed) return;

    setRevokingId(id);
    try {
      const response = await fetch(`${API_URL}/shares/${id}/revoke`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const result = await response.json();

      if (response.ok) {
        toast.success("Link revoked");
        setShares((prev) => prev.filter((s) => s.id !== id));
      } else {
        toast.error(result.message || "Could not revoke link");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="bg-[#19191a] rounded-2xl border border-white/10">
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
          <h2 className="text-white text-2xl font-bold">Active Links</h2>
          <span className="text-white/40 text-sm">{shares.length} active</span>
        </div>

        {loading ? (
          <div className="px-8 py-10 text-white/40 text-sm">Loading active links...</div>
        ) : shares.length === 0 ? (
          <div className="px-8 py-10 text-white/40 text-sm">
            No active links yet. Use "Copy Link" on a file to create one.
          </div>
        ) : (
          shares.map((share) => {
            const Icon = getFileIcon(share.originalName);
            return (
              <div
                key={share.id}
                className="flex items-center justify-between px-8 py-4 border-t border-white/5 hover:bg-white/5 transition"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#6245F5] flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-white text-sm font-semibold truncate">
                      {share.originalName}
                    </div>
                    <div className="text-white/40 text-xs truncate flex items-center gap-1">
                      <Link2 size={12} />
                      {share.shareUrl}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 pl-4">
                  <span className="text-white/40 text-xs hidden sm:block">
                    {formatDate(share.createdAt)}
                  </span>
                  <button
                    onClick={() => handleCopy(share.shareUrl)}
                    title="Copy link"
                    className="text-white/50 hover:text-white transition"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    onClick={() => handleRevoke(share.id)}
                    disabled={revokingId === share.id}
                    title="Revoke link"
                    className="text-white/50 hover:text-red-400 transition disabled:opacity-50"
                  >
                    <Ban size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
