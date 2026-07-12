import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [globalPassword, setGlobalPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, id, password, globalPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || "Admin login failed");
        return;
      }

      localStorage.setItem("adminToken", result.token);
      toast.success(result.message || "Welcome back, Admin");
      navigate("/admin/dashboard");
    } catch (error) {
      console.log(error);
      toast.error("Could not connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#090a09] min-h-screen flex justify-center items-center px-4">
      <div className="bg-[#111111] border border-gray-700 rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#6245F5]/20 flex items-center justify-center">
            <Shield size={28} className="text-[#8b7bff]" />
          </div>
        </div>

        <h1 className="text-3xl text-white font-bold text-center">Admin Login</h1>
        <p className="text-gray-400 text-center mt-3">
          Sign in with your admin credentials
        </p>

        <form onSubmit={handleSubmit} className="mt-8">
          <div className="mb-5">
            <label className="block text-gray-300 mb-2 font-medium">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="admin@vaultx.com"
              className="w-full px-4 py-3 rounded-xl bg-[#1d1d1d] border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="mb-5">
            <label className="block text-gray-300 mb-2 font-medium">Admin ID</label>
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              type="text"
              placeholder="Enter your admin ID"
              className="w-full px-4 py-3 rounded-xl bg-[#1d1d1d] border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="mb-5">
            <label className="block text-gray-300 mb-2 font-medium">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter admin password"
              className="w-full px-4 py-3 rounded-xl bg-[#1d1d1d] border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2 font-medium">Global Password</label>
            <input
              value={globalPassword}
              onChange={(e) => setGlobalPassword(e.target.value)}
              type="password"
              placeholder="Enter global password"
              className="w-full px-4 py-3 rounded-xl bg-[#1d1d1d] border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition py-3 rounded-xl text-white font-semibold disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
