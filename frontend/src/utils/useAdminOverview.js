import { useCallback, useEffect, useState } from "react";
import { API_URL } from "./api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

const POLL_INTERVAL = 15000;

// Single source of truth for admin sidebar + notification bell:
// total users / storage (from /admin/stats) and the three "waiting on you" queues.
export function useAdminOverview() {
  const [stats, setStats] = useState(null);
  const [counts, setCounts] = useState({ pending: 0, deletion: 0, bucket: 0 });

  const fetchOverview = useCallback(async () => {
    try {
      const [statsRes, pendingRes, deletionRes, bucketRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers: authHeaders() }),
        fetch(`${API_URL}/admin/pending`, { headers: authHeaders() }),
        fetch(`${API_URL}/admin/deletion-requests`, { headers: authHeaders() }),
        fetch(`${API_URL}/admin/bucket-requests`, { headers: authHeaders() }),
      ]);

      const [statsData, pendingData, deletionData, bucketData] = await Promise.all([
        statsRes.json(),
        pendingRes.json(),
        deletionRes.json(),
        bucketRes.json(),
      ]);

      if (statsRes.ok) setStats(statsData);

      setCounts({
        pending: pendingRes.ok ? pendingData.requests?.length || 0 : 0,
        deletion: deletionRes.ok ? deletionData.requests?.length || 0 : 0,
        bucket: bucketRes.ok ? bucketData.requests?.length || 0 : 0,
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, POLL_INTERVAL);

    // let any page (e.g. after an approve/reject action) force an instant refresh
    window.addEventListener("admin-requests-changed", fetchOverview);
    return () => {
      clearInterval(interval);
      window.removeEventListener("admin-requests-changed", fetchOverview);
    };
  }, [fetchOverview]);

  const totalRequests = counts.pending + counts.deletion + counts.bucket;

  return { stats, counts, totalRequests, refresh: fetchOverview };
}
