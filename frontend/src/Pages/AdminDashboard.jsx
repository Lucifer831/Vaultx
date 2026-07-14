import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Users,
  HardDrive,
  CheckCircle2,
  XCircle,
  Link2,
  Ban,
  Database,
  UserPlus,
  Trash2,
  BarChart3,
} from "lucide-react";
import AdminLayout from "../Component/AdminLayout";
import { formatStorage } from "../utils/format";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

// notify the header bell (and anything else listening) that request counts may have changed
const pingRequestsChanged = () => window.dispatchEvent(new Event("admin-requests-changed"));

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [bucketRequests, setBucketRequests] = useState([]);
  const [shares, setShares] = useState([]);
  const [actingId, setActingId] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, pendingRes, deletionRes, bucketRes, sharesRes] = await Promise.all([
        fetch("http://localhost:8080/admin/stats", { headers: authHeaders() }),
        fetch("http://localhost:8080/admin/pending", { headers: authHeaders() }),
        fetch("http://localhost:8080/admin/deletion-requests", { headers: authHeaders() }),
        fetch("http://localhost:8080/admin/bucket-requests", { headers: authHeaders() }),
        fetch("http://localhost:8080/admin/shares", { headers: authHeaders() }),
      ]);

      if (
        statsRes.status === 401 ||
        pendingRes.status === 401 ||
        deletionRes.status === 401 ||
        bucketRes.status === 401 ||
        sharesRes.status === 401
      ) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
        return;
      }

      const statsData = await statsRes.json();
      const pendingData = await pendingRes.json();
      const deletionData = await deletionRes.json();
      const bucketData = await bucketRes.json();
      const sharesData = await sharesRes.json();

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

      if (deletionRes.ok) {
        setDeletionRequests(deletionData.requests);
      } else {
        toast.error(deletionData.message || "Could not load deletion requests");
      }

      if (bucketRes.ok) {
        setBucketRequests(bucketData.requests);
      } else {
        toast.error(bucketData.message || "Could not load bucket requests");
      }

      if (sharesRes.ok) {
        setShares(sharesData.shares);
      } else {
        toast.error(sharesData.message || "Could not load active links");
      }

      pingRequestsChanged();
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

  const handleDeletionDecision = async (id, action) => {
    setActingId(id);

    try {
      const response = await fetch(`http://localhost:8080/admin/deletion-requests/${id}/${action}`, {
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

  const handleBucketDecision = async (id, action) => {
    setActingId(id);

    try {
      const response = await fetch(`http://localhost:8080/admin/bucket-requests/${id}/${action}`, {
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

  const handleRevokeShare = async (id) => {
    setActingId(id);

    try {
      const response = await fetch(`http://localhost:8080/admin/shares/${id}/revoke`, {
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

  // ----- chart data -----
  const chartData = [
    { label: "Signup Requests", value: pending.length, color: "#8b7bff", bg: "bg-[#6245F5]" },
    { label: "Deletion Requests", value: deletionRequests.length, color: "#f87171", bg: "bg-red-500" },
    { label: "Bucket Requests", value: bucketRequests.length, color: "#34d399", bg: "bg-emerald-500" },
    { label: "Active Share Links", value: shares.length, color: "#60a5fa", bg: "bg-blue-500" },
  ];
  const chartMax = Math.max(...chartData.map((d) => d.value), 1);

  // section wrapper class — a soft green glow along the left edge appears when there's something waiting
  const sectionClass = (count) =>
    `mt-8 bg-[#111111] border border-white/10 rounded-2xl overflow-hidden transition-shadow ${
      count > 0 ? "border-l-2 border-l-emerald-400/70 animate-glow" : ""
    }`;

  return (
    <AdminLayout title="Admin Overview" subtitle="Monitor requests, users, and storage at a glance">
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

      {/* Requests overview chart */}
      <div className="mt-8 bg-[#111111] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-[#6245F5]/15 flex items-center justify-center shrink-0">
            <BarChart3 size={16} className="text-[#8b7cf6]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">Requests Overview</h2>
            <p className="text-gray-500 text-xs mt-0.5">Everything currently waiting on your review</p>
          </div>
        </div>

        <div className="space-y-5">
          {chartData.map(({ label, value, color, bg }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-gray-300 text-sm font-medium">{label}</span>
                <span className="text-white text-sm font-bold">{value}</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${bg} transition-all duration-700 ease-out`}
                  style={{
                    width: value === 0 ? "3%" : `${Math.max((value / chartMax) * 100, 6)}%`,
                    opacity: value === 0 ? 0.25 : 1,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending signup requests */}
      <div className={sectionClass(pending.length)}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#6245F5]/15 flex items-center justify-center shrink-0">
              <UserPlus size={16} className="text-[#8b7cf6]" />
            </div>
            <h2 className="text-lg font-bold text-white">Pending Signup Requests</h2>
          </div>
          <span
            className={`text-sm flex items-center gap-1.5 ${
              pending.length > 0 ? "text-emerald-400 font-semibold" : "text-gray-500"
            }`}
          >
            {pending.length > 0 && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            {pending.length} waiting
          </span>
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

      {/* Account deletion requests */}
      <div className={sectionClass(deletionRequests.length)}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
              <Trash2 size={16} className="text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Account Deletion Requests</h2>
          </div>
          <span
            className={`text-sm flex items-center gap-1.5 ${
              deletionRequests.length > 0 ? "text-emerald-400 font-semibold" : "text-gray-500"
            }`}
          >
            {deletionRequests.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
            {deletionRequests.length} waiting
          </span>
        </div>

        {deletionRequests.length === 0 ? (
          <p className="text-gray-500 text-sm px-6 py-8 text-center">
            No deletion requests right now 🎉
          </p>
        ) : (
          <div className="divide-y divide-white/10">
            {deletionRequests.map((req) => (
              <div key={req._id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-white font-semibold">{req.fullname}</p>
                  <p className="text-gray-500 text-sm">{req.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    disabled={actingId === req._id}
                    onClick={() => handleDeletionDecision(req._id, "approve")}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} /> Confirm Delete
                  </button>
                  <button
                    disabled={actingId === req._id}
                    onClick={() => handleDeletionDecision(req._id, "reject")}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition disabled:opacity-50"
                  >
                    <XCircle size={16} /> Keep Account
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New bucket requests */}
      <div className={sectionClass(bucketRequests.length)}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
              <Database size={16} className="text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-white">New Bucket Requests</h2>
          </div>
          <span
            className={`text-sm flex items-center gap-1.5 ${
              bucketRequests.length > 0 ? "text-emerald-400 font-semibold" : "text-gray-500"
            }`}
          >
            {bucketRequests.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
            {bucketRequests.length} waiting
          </span>
        </div>

        {bucketRequests.length === 0 ? (
          <p className="text-gray-500 text-sm px-6 py-8 text-center">
            No bucket requests right now 🎉
          </p>
        ) : (
          <div className="divide-y divide-white/10">
            {bucketRequests.map((req) => (
              <div key={req._id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#6245F5]/15 flex items-center justify-center shrink-0">
                    <Database size={16} className="text-[#8b7cf6]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{req.fullname}</p>
                    <p className="text-gray-500 text-sm">
                      {req.email}
                      {req.bucketRequestedSize && (
                        <span className="text-[#8b7cf6]"> • wants {req.bucketRequestedSize}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    disabled={actingId === req._id}
                    onClick={() => handleBucketDecision(req._id, "approve")}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} /> Approve
                  </button>
                  <button
                    disabled={actingId === req._id}
                    onClick={() => handleBucketDecision(req._id, "reject")}
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

      {/* Active share links, grouped with their owner */}
      <div className={sectionClass(shares.length)}>
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
          <p className="text-gray-500 text-sm px-6 py-8 text-center">
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
                  onClick={() => handleRevokeShare(share.id)}
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
