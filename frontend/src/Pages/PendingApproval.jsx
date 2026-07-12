import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";

export default function PendingApproval() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  return (
    <div className="min-h-screen bg-[#090a09] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#111111] border border-gray-700 rounded-3xl shadow-2xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-[#6245F5]/20 flex items-center justify-center">
            <Clock size={32} className="text-[#8b7bff]" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white">Waiting for Admin Approval</h1>

        <p className="text-gray-400 mt-3">
          Your email{email ? ` (${email})` : ""} is verified ✅. An admin needs to
          approve your account before you can log in — this usually doesn't take long.
        </p>

        <button
          onClick={() => navigate("/", { state: { showLogin: true } })}
          className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 transition py-3 rounded-xl text-white font-semibold"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
