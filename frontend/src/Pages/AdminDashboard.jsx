import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Users, HardDrive, CheckCircle2, XCircle } from "lucide-react";
import AdminLayout from "../Component/AdminLayout";
import { formatStorage } from "../utils/format";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [actingId, setActingId] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        fetch("http://localhost:8080/admin/stats", { headers: authHeaders() }),
        fetch("http://localhost:8080/admin/pending", { headers: authHeaders() }),
      ]);

      if (statsRes.status === 401 || pendingRes.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
        return;
      }

      const statsData = await statsRes.json();
      const pendingData = await pendingRes.json();

      if (statsRes.ok) {
        setStats(statsData);
      } else {
        toast.error(statsData.message || "Could not load stats");
      }

      if (pendingRes.ok) {
        setPending(pendingData.requests);
      } else {
        toast.error(pendingData.message || "Could not load pending requests");
      }
    } catch (error) {
      console.log(error);
      toast.error("Could not load dashboard data");
    }
  }, [navigate]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDecision = async (id, action) => {
    setActingId(id);

    try {
      const response = await fetch(`http://localhost:8080/admin/${action}/${id}`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || "Action failed");
        return;
      }

      toast.success(result.message);
      fetchAll();
    } catch (error) {
      console.log(error);
      toast.error("Could not connect to the server");
    } finally {
      setActingId(null);
    }
  };

  const storagePercent = stats
    ? Math.min((stats.totalStorageUsed / (stats.totalStorageCapacity || 1)) * 100, 100)
    : 0;

  return (
    <AdminLayout title="Admin Overview">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
          <p className="text-gray-400 text-xs font-semibold tracking-wide uppercase">
            Pending Requests
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-3xl font-bold text-white">
              {stats?.pendingRequests ?? "—"}
            </span>
            <ClipboardList className="text-[#8b7bff]" size={32} />
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
          <p className="text-gray-400 text-xs font-semibold tracking-wide uppercase">
            Total Users
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-3xl font-bold text-white">{stats?.totalUsers ?? "—"}</span>
            <Users className="text-[#8b7bff]" size={32} />
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
          <p className="text-gray-400 text-xs font-semibold tracking-wide uppercase">
            Storage Used
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-3xl font-bold text-white">
              {stats ? formatStorage(stats.totalStorageUsed) : "—"}
            </span>
            <HardDrive className="text-[#8b7bff]" size={32} />
          </div>
          {stats && (
            <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#6245F5]"
                style={{ width: `${storagePercent}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Pending signup requests */}
      <div className="mt-8 bg-[#111111] border border-white/10 rounded-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Pending Signup Requests</h2>
          <span className="text-gray-500 text-sm">{pending.length} waiting</span>
        </div>

        {pending.length === 0 ? (
          <p className="text-gray-500 text-sm px-6 py-8 text-center">
            No pending requests right now 🎉
          </p>
        ) : (
          <div className="divide-y divide-white/10">
            {pending.map((req) => (
              <div key={req._id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-white font-semibold">{req.fullname}</p>
                  <p className="text-gray-500 text-sm">{req.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    disabled={actingId === req._id}
                    onClick={() => handleDecision(req._id, "approve")}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} /> Approve
                  </button>
                  <button
                    disabled={actingId === req._id}
                    onClick={() => handleDecision(req._id, "reject")}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition disabled:opacity-50"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
