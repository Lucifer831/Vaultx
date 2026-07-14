import React, { useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Mail, KeyRound, Lock, Fingerprint, ArrowLeft } from "lucide-react";
import vault from "/vault1.png";
import { API_URL } from "../utils/api";

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

    // Render free-tier servers sleep after inactivity and can take
    // 30-50s to wake up on the first request. Let the admin know
    // instead of leaving them staring at a stuck button.
    const wakeupTimer = setTimeout(() => {
      toast.info("Server is waking up, this can take up to 40 seconds ⏳");
    }, 4000);

    try {
      const response = await fetch(`${API_URL}/admin/login`, {
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
      clearTimeout(wakeupTimer);
      setLoading(false);
    }
  };

  const fields = [
    {
      label: "Email",
      value: email,
      setter: setEmail,
      type: "email",
      placeholder: "admin@vaultx.com",
      icon: Mail,
    },
    {
      label: "Admin ID",
      value: id,
      setter: setId,
      type: "text",
      placeholder: "Enter your admin ID",
      icon: Fingerprint,
    },
    {
      label: "Password",
      value: password,
      setter: setPassword,
      type: "password",
      placeholder: "Enter admin password",
      icon: KeyRound,
    },
    {
      label: "Global Password",
      value: globalPassword,
      setter: setGlobalPassword,
      type: "password",
      placeholder: "Enter global password",
      icon: Lock,
    },
  ];

  return (
    <div className="min-h-screen bg-[#090a09] flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center border-r border-white/10">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#6245F5]/20 blur-[120px]" />
        <div className="absolute -bottom-32 -right-10 w-96 h-96 rounded-full bg-[#8b7bff]/10 blur-[120px]" />

        <div className="relative z-10 text-center px-12">
          <img src={vault} alt="VaultX" className="w-[300px] mx-auto object-contain" />
          <div className="flex items-center justify-center gap-2 mt-2 mb-6">
            <ShieldCheck size={16} className="text-[#8b7bff]" />
            <span className="text-[#8b7bff] text-xs font-semibold tracking-[0.2em] uppercase">
              Admin Console
            </span>
          </div>
          <p className="text-white/40 text-sm max-w-xs mx-auto leading-relaxed">
            Manage users, storage requests, and active share links from one secure control center.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 relative">
        <Link
          to="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-white text-sm transition"
        >
          <ArrowLeft size={16} />
          Back to site
        </Link>

        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-6">
            <img src={vault} alt="VaultX" className="w-[180px] object-contain" />
          </div>

          <div className="bg-[#111111] border border-white/10 rounded-3xl shadow-2xl p-8">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#6245F5]/20 flex items-center justify-center">
                <ShieldCheck size={28} className="text-[#8b7bff]" />
              </div>
            </div>

            <h1 className="text-3xl text-white font-bold text-center">Admin Login</h1>
            <p className="text-gray-500 text-center mt-2 text-sm">
              Sign in with your admin credentials to continue
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {fields.map(({ label, value, setter, type, placeholder, icon: Icon }) => (
                <div key={label}>
                  <label className="block text-gray-300 mb-2 font-medium text-sm">{label}</label>
                  <div className="relative">
                    <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      type={type}
                      placeholder={placeholder}
                      disabled={loading}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#1d1d1d] border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-[#6245F5] transition disabled:opacity-50"
                    />
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6245F5] hover:bg-[#5238d6] transition py-3 rounded-xl text-white font-semibold disabled:opacity-50 mt-2 shadow-lg shadow-[#6245F5]/20"
              >
                {loading ? "Signing in..." : "Login as Admin"}
              </button>
            </form>
          </div>

          <p className="text-center text-gray-600 text-xs mt-6">
            Restricted access — authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
}
