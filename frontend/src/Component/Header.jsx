import React from "react";
import { useNavigate } from "react-router-dom";
import vault from "/vault1.png";
import { Search, LogOut } from "lucide-react";
import { toast } from "react-toastify";
import NotificationBell from "./NotificationBell";

export default function Header({ searchQuery = "", onSearchChange = () => {} }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out");
    navigate("/");
  };

  return (
    <nav className="bg-[#131314] h-[80px] px-8 flex items-center justify-between border-b border-white/10">

      {/* Logo */}
      <div className="flex items-center gap-3">
        <img
          src={vault}
          alt="Logo"
          className="w-[255px] h-[105px]"
        />
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl mx-6">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search your files, folders, or backups..."
            className="w-full h-[46px] text-white text-sm pl-11 pr-5 bg-[#1c1b1c] border border-white/10 rounded-xl outline-none placeholder:text-white/30 focus:border-[#6245F5]/50 transition"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-4">
        <NotificationBell />

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 h-[42px] rounded-xl border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

    </nav>
  );
}