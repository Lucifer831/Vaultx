import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");

  const handledata = async (e) => {
    e.preventDefault();

    const data = { email, password };

    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);

        // Save token and user
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));

        // Redirect to Home Page
        navigate("/home");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <form onSubmit={handledata}>
      <div className="mt-8">
        {/* Email */}
        <div className="mb-5">
          <label className="block text-gray-300 mb-2 font-medium">
            Email
          </label>

          <input
            value={email}
            onChange={(e) => setemail(e.target.value)}
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-3 rounded-xl bg-[#1d1d1d] border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-indigo-500"
          />
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="block text-gray-300 mb-2 font-medium">
            Password
          </label>

          <input
            value={password}
            onChange={(e) => setpassword(e.target.value)}
            type="password"
            placeholder="Enter your password"
            className="w-full px-4 py-3 rounded-xl bg-[#1d1d1d] border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex justify-end mb-6">
          <button
            type="button"
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 transition py-3 rounded-xl text-white font-semibold"
        >
          Login
        </button>

        <Link
          to="/admin/login"
          className="flex items-center justify-center gap-2 w-full mt-4 py-3 rounded-xl border border-gray-700 text-gray-300 hover:border-indigo-500 hover:text-white transition"
        >
          🛡️ Login as Admin
        </Link>
      </div>
    </form>
  );
}