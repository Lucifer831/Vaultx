import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Search, UserPlus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../Component/AdminLayout";
import { formatStorage } from "../utils/format";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

const statusStyles = {
  approved: "bg-green-600/20 text-green-400",
  pending: "bg-yellow-600/20 text-yellow-400",
  rejected: "bg-red-600/20 text-red-400",
};

const ONE_GB = 1024 * 1024 * 1024;

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ fullname: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8080/admin/users", {
        headers: authHeaders(),
      });

      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
        return;
      }

      const result = await response.json();
      if (response.ok) setUsers(result.users);
    } catch (error) {
      console.log(error);
      toast.error("Could not load users");
    }
  }, [navigate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This also removes all of their files.`)) return;

    try {
      const response = await fetch(`http://localhost:8080/admin/users/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || "Unable to delete user");
        return;
      }

      toast.success(result.message);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.log(error);
      toast.error("Could not connect to the server");
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:8080/admin/users", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || "Unable to add user");
        return;
      }

      toast.success(result.message);
      setForm({ fullname: "", email: "", password: "" });
      setShowAddModal(false);
      fetchUsers();
    } catch (error) {
      console.log(error);
      toast.error("Could not connect to the server");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullname.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="User Management" subtitle="View, search, and manage every VaultX account">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 flex items-center gap-3 bg-[#111111] border border-white/10 rounded-xl px-4 py-3">
          <Search size={18} className="text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
          />
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
        >
          <UserPlus size={18} /> Add User
        </button>
      </div>

      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wide">
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Storage Usage</th>
              <th className="px-6 py-4 font-semibold">Date Joined</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredUsers.map((u) => {
              const percent = Math.min((u.storageUsed / ONE_GB) * 100, 100);
              return (
                <tr key={u.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#6245F5]/20 flex items-center justify-center text-[#8b7bff] font-semibold">
                        {u.fullname?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{u.fullname}</p>
                        <p className="text-gray-500 text-sm">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                        statusStyles[u.approvalStatus] || "bg-gray-600/20 text-gray-400"
                      }`}
                    >
                      {u.approvalStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white text-sm">{formatStorage(u.storageUsed)} / 1 GB</p>
                    <div className="mt-1 h-1.5 w-32 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          percent >= 90 ? "bg-red-500" : "bg-[#6245F5]"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(u.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(u.id, u.fullname)}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-600/20 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <p className="text-gray-500 text-sm px-6 py-8 text-center">No users found</p>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-[#111111] border border-gray-700 rounded-3xl shadow-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white">Add User</h2>
            <p className="text-gray-400 mt-2 text-sm">
              Skips OTP + approval — the account is created and approved right away.
            </p>

            <form onSubmit={handleAddUser} className="mt-6">
              <div className="mb-4">
                <label className="block text-gray-300 mb-2 font-medium text-sm">
                  Full Name
                </label>
                <input
                  required
                  value={form.fullname}
                  onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#1d1d1d] border border-gray-700 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2 font-medium text-sm">Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#1d1d1d] border border-gray-700 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 mb-2 font-medium text-sm">
                  Password
                </label>
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#1d1d1d] border border-gray-700 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
