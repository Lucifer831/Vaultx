import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, LogOut, Shield } from "lucide-react";
import { toast } from "react-toastify";

export default function AdminLayout({ title, children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    toast.success("Logged out");
    navigate("/admin/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
      isActive
        ? "bg-[#6245F5]/20 text-[#8b7bff]"
        : "text-gray-400 hover:text-white hover:bg-white/5"
    }`;

  return (
    <div className="min-h-screen bg-[#090a09] flex">

      <aside className="w-[280px] shrink-0 bg-[#111111] border-r border-white/10 flex flex-col py-6 px-4 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#6245F5]/20 flex items-center justify-center">
            <Shield size={20} className="text-[#8b7bff]" />
          </div>
          <span className="text-white text-xl font-bold">VaultX</span>
        </div>

        <nav className="flex flex-col gap-2">
          <NavLink to="/admin/dashboard" className={linkClass}>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={linkClass}>
            <Users size={20} />
            User Management
          </NavLink>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <header className="h-[80px] px-8 flex items-center justify-between border-b border-white/10">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6245F5] flex items-center justify-center text-white font-semibold">
              A
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-tight">Admin User</p>
              <p className="text-gray-500 text-xs leading-tight">Super Admin</p>
            </div>
          </div>
        </header>

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
