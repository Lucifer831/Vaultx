import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { toast } from "react-toastify";
import { API_URL } from "../utils/api";

export default function DeleteAccountModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Email and password are required");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/account/delete-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const result = await response.json();

      if (response.ok) {
        setDone(true);
        toast.success("Deletion request submitted");
      } else {
        toast.error(result.message || "Could not submit request");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#19191a] border border-white/10 rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-white/40 hover:text-white transition"
        >
          <X size={20} />
        </button>

        {done ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-green-400" size={26} />
            </div>
            <h2 className="text-white text-xl font-bold mb-2">One step complete!</h2>
            <p className="text-white/50 text-sm">
              Your account will be deleted once the admin accepts the request.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-semibold transition"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="text-red-400" size={20} />
              </div>
              <h2 className="text-white text-xl font-bold">Delete Account</h2>
            </div>
            <p className="text-white/40 text-sm mb-6">
              Confirm your email and password. Your account will only be permanently deleted
              after an admin approves this request.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/60 text-xs font-semibold mb-2">EMAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#0f0f10] border border-white/10 text-white placeholder-white/30 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-white/60 text-xs font-semibold mb-2">PASSWORD</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl bg-[#0f0f10] border border-white/10 text-white placeholder-white/30 outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Request Account Deletion"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
