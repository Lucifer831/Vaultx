import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, LogOut, ShieldCheck, ChevronRight, ClipboardList, Link2 } from "lucide-react";
import { toast } from "react-toastify";
import vault from "/vault1.png";
import AdminNotificationBell from "./AdminNotificationBell";

export default function AdminLayout({ title, subtitle, children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    toast.success("Logged out");
    navigate("/admin/login");
  };

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all relative ${
      isActive
        ? "bg-gradient-to-r from-[#6245F5]/25 to-[#6245F5]/5 text-white"
        : "text-gray-400 hover:text-white hover:bg-white/5"
    }`;

  const navItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/users", label: "User Management", icon: Users },
    { to: "/admin/requests", label: "Requests", icon: ClipboardList },
    { to: "/admin/shares", label: "Share Links", icon: Link2 },
  ];

  return (
    <div className="min-h-screen bg-[#090a09] flex">
      {/* Sidebar */}
      <aside className="w-[280px] shrink-0 bg-[#111111] border-r border-white/10 flex flex-col py-6 px-4 sticky top-0 h-screen overflow-y-auto">
        {/* Logo — same as user-side header */}
        <div className="flex items-center px-1 mb-4">
          <img src={vault} alt="VaultX" className="w-[170px] h-auto object-contain" />
        </div>

        <div className="flex items-center gap-2 px-3 py-2 mb-6 rounded-lg bg-[#6245F5]/10 border border-[#6245F5]/20 w-fit">
          <ShieldCheck size={14} className="text-[#8b7bff]" />
          <span className="text-[#8b7bff] text-xs font-semibold tracking-wide uppercase">
            Admin Console
          </span>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-[#8b7bff]" />
                  )}
                  <Icon size={20} className={isActive ? "text-[#8b7bff]" : ""} />
                  <span className="flex-1">{label}</span>
                  <ChevronRight
                    size={16}
                    className={`transition-opacity ${
                      isActive ? "opacity-100 text-[#8b7bff]" : "opacity-0 group-hover:opacity-40"
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Admin profile card */}
        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.03] mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6245F5] to-[#8b7bff] flex items-center justify-center text-white font-bold shrink-0">
              A
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold leading-tight truncate">Admin User</p>
              <p className="text-[#8b7bff] text-xs leading-tight mt-0.5">Super Admin</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <header className="h-[80px] px-8 flex items-center justify-between border-b border-white/10 bg-[#090a09]/80 backdrop-blur sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-white leading-tight">{title}</h1>
            {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
            <AdminNotificationBell />

            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6245F5] to-[#8b7bff] flex items-center justify-center text-white font-semibold shrink-0">
                A
              </div>
              <div>
                <p className="text-white text-sm font-semibold leading-tight">Admin User</p>
                <p className="text-gray-500 text-xs leading-tight">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
