import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, UserPlus, Trash2, Database } from "lucide-react";

export default function AdminNotificationBell({ counts = { pending: 0, deletion: 0, bucket: 0 } }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const total = counts.pending + counts.deletion + counts.bucket;
  const hasRequests = total > 0;

  const items = [
    {
      key: "pending",
      label: "New signup requests",
      count: counts.pending,
      icon: UserPlus,
      color: "text-[#8b7bff]",
      bg: "bg-[#6245F5]/15",
    },
    {
      key: "deletion",
      label: "Account deletion requests",
      count: counts.deletion,
      icon: Trash2,
      color: "text-red-400",
      bg: "bg-red-500/15",
    },
    {
      key: "bucket",
      label: "New bucket requests",
      count: counts.bucket,
      icon: Database,
      color: "text-emerald-400",
      bg: "bg-emerald-500/15",
    },
  ];

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition"
      >
        <Bell size={20} className={hasRequests ? "animate-wiggle" : ""} />
        {hasRequests && (
          <>
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </>
        )}
        {total > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {total > 9 ? "9+" : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-[#141414] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <p className="text-white font-semibold text-sm">Notifications</p>
            {hasRequests && (
              <span className="text-emerald-400 text-xs font-medium">{total} pending</span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {!hasRequests ? (
              <p className="text-gray-500 text-sm px-4 py-8 text-center">
                You're all caught up 🎉
              </p>
            ) : (
              items
                .filter((i) => i.count > 0)
                .map(({ key, label, count, icon: Icon, color, bg }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setOpen(false);
                      navigate("/admin/dashboard");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left"
                  >
                    <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                      <Icon size={16} className={color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{label}</p>
                      <p className="text-gray-500 text-xs">Someone is waiting on your review</p>
                    </div>
                    <span className="text-white text-sm font-bold shrink-0">{count}</span>
                  </button>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
