import React, { useEffect, useRef, useState } from "react";
import { Bell, Upload, Trash2, RotateCcw, XCircle } from "lucide-react";

const iconFor = (type) => {
  if (type === "upload") return { Icon: Upload, color: "text-green-400" };
  if (type === "delete") return { Icon: Trash2, color: "text-yellow-400" };
  if (type === "restore") return { Icon: RotateCcw, color: "text-blue-400" };
  if (type === "permanent-delete") return { Icon: XCircle, color: "text-red-400" };
  return { Icon: Bell, color: "text-white/60" };
};

const timeAgo = (dateStr) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const token = () => localStorage.getItem("token");

  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://localhost:8080/notifications", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const result = await response.json();
      if (response.ok) {
        setNotifications(result.notifications || []);
        setUnreadCount(result.unreadCount || 0);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // refresh whenever a file action happens anywhere in the app
    window.addEventListener("file-uploaded", fetchNotifications);
    window.addEventListener("storage-changed", fetchNotifications);
    return () => {
      window.removeEventListener("file-uploaded", fetchNotifications);
      window.removeEventListener("storage-changed", fetchNotifications);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    // clear instantly in the UI, then confirm with the server
    setUnreadCount(0);
    try {
      await fetch("http://localhost:8080/notifications/read", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}` },
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative w-[44px] h-[44px] rounded-full bg-[#1c1b1c] border border-white/10 flex items-center justify-center hover:bg-white/10 transition"
      >
        <Bell size={20} className="text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[52px] w-[340px] bg-[#1c1b1c] border border-white/10 rounded-2xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h3 className="text-white font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[#8b7bff] hover:text-white transition"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-8">No notifications yet</p>
            ) : (
              notifications.map((n) => {
                const { Icon, color } = iconFor(n.type);
                return (
                  <div
                    key={n._id}
                    className={`flex items-start gap-3 px-5 py-3 border-t border-white/5 ${
                      !n.read ? "bg-white/[0.03]" : ""
                    }`}
                  >
                    <Icon size={16} className={`${color} mt-0.5 shrink-0`} />
                    <div className="min-w-0">
                      <p className="text-white text-sm">{n.message}</p>
                      <p className="text-white/30 text-xs mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
