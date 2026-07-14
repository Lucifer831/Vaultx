import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Database,
  UserPlus,
  Trash2,
} from "lucide-react";
import AdminLayout from "../Component/AdminLayout";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

const pingRequestsChanged = () => window.dispatchEvent(new Event("admin-requests-changed"));

export default function AdminRequests() {
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [bucketRequests, setBucketRequests] = useState([]);
  const [actingId, setActingId] = useState(null);
  const [tab, setTab] = useState("signup"); // signup | deletion | bucket

  const fetchAll = useCallback(async () => {
    try {
      const [pendingRes, deletionRes, bucketRes] = await Promise.all([
        fetch("http://localhost:8080/admin/pending", { headers: authHeaders() }),
        fetch("http://localhost:8080/admin/deletion-requests", { headers: authHeaders() }),
        fetch("http://localhost:8080/admin/bucket-requests", { headers: authHeaders() }),
      ]);

      if (pendingRes.status === 401 || deletionRes.status === 401 || bucketRes.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
        return;
      }

      const pendingData = await pendingRes.json();
      const deletionData = await deletionRes.json();
      const bucketData = await bucketRes.json();

      if (pendingRes.ok) setPending(pendingData.requests);
      else toast.error(pendingData.message || "Could not load pending requests");

      if (deletionRes.ok) setDeletionRequests(deletionData.requests);
      else toast.error(deletionData.message || "Could not load deletion requests");

      if (bucketRes.ok) setBucketRequests(bucketData.requests);
      else toast.error(bucketData.message || "Could not load bucket requests");

      pingRequestsChanged();
    } catch (error) {
      console.log(error);
      toast.error("Could not load requests");
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

  const tabs = [
    { key: "signup", label: "Signup", count: pending.length, icon: UserPlus },
    { key: "deletion", label: "Deletion", count: deletionRequests.length, icon: Trash2 },
    { key: "bucket", label: "Bucket", count: bucketRequests.length, icon: Database },
  ];

  return (
    <AdminLayout title="Requests" subtitle="Review signup, deletion, and bucket requests">
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {tabs.map(({ key, label, count, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
              tab === key
                ? "bg-[#6245F5]/20 text-white border border-[#6245F5]/40"
                : "text-gray-400 border border-white/10 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon size={16} />
            {label} Requests
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                count > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-gray-500"
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Signup requests */}
      {tab === "signup" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
          {pending.length === 0 ? (
            <p className="text-gray-500 text-sm px-6 py-10 text-center">
              No pending signup requests right now 🎉
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
      )}

      {/* Deletion requests */}
      {tab === "deletion" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
          {deletionRequests.length === 0 ? (
            <p className="text-gray-500 text-sm px-6 py-10 text-center">
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
      )}

      {/* Bucket requests */}
      {tab === "bucket" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
          {bucketRequests.length === 0 ? (
            <p className="text-gray-500 text-sm px-6 py-10 text-center">
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
      )}
    </AdminLayout>
  );
}
