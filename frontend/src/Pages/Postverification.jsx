import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Postverification() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || sessionStorage.getItem("pendingVerificationEmail");

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalOtp = otp.join("");

    if (!email) {
      toast.error("Signup again to receive an OTP");
      navigate("/");
      return;
    }

    if (finalOtp.length !== 4) {
      toast.error("Enter the complete 4-digit OTP");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/verifyemail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpemail: finalOtp }),
      });
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || "OTP verification failed");
        return;
      }

      sessionStorage.removeItem("pendingVerificationEmail");
      toast.success("Email verified successfully ✅");
      setTimeout(() => navigate("/pending-approval", { state: { email } }), 1200);
    } catch {
      toast.error("Could not connect to the server");
    }
  };

  return (
    <div className="min-h-screen bg-[#090a09] flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-[#111111] border border-gray-700 rounded-3xl shadow-2xl p-8">

        <h1 className="text-3xl font-bold text-white text-center">
          Verify Email
        </h1>

        <p className="text-gray-400 text-center mt-3">
          Enter the 4-digit OTP sent to {email || "your email"}.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="flex justify-between mt-10">

            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                className="w-16 h-16 text-center text-2xl font-bold rounded-xl bg-[#1d1d1d] border border-gray-700 text-white outline-none focus:border-indigo-500 transition-all duration-300"
              />
            ))}

          </div>

          <button
            type="submit"
            className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 py-3 rounded-xl text-white font-semibold"
          >
            Verify OTP
          </button>

        </form>

        <p className="text-center text-gray-400 mt-6">
          Didn't receive the code?
        </p>

        <button
          className="w-full mt-3 border border-indigo-600 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all duration-300 py-3 rounded-xl"
        >
          Resend OTP
        </button>

      </div>

    </div>
  );
}
