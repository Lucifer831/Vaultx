import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Database, Check } from "lucide-react";
import { toast } from "react-toastify";

const plans = [
  {
    id: "1GB",
    title: "Extra 1 GB",
    tagline: "Good for a light top-up",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    features: ["+1 GB extra storage", "Same upload speed", "Admin approval required"],
  },
  {
    id: "3GB",
    title: "Extra 3 GB",
    tagline: "Most picked by users",
    color: "text-[#8b7cf6]",
    bg: "bg-[#6245F5]/15",
    highlighted: true,
    features: ["+3 GB extra storage", "Priority review", "Admin approval required"],
  },
  {
    id: "5GB",
    title: "Extra 5+ GB",
    tagline: "For heavy storage needs",
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    features: ["+5 GB extra storage", "Custom limits on request", "Admin approval required"],
  },
];

export default function NewBucketPlans() {
  const navigate = useNavigate();
  const [requesting, setRequesting] = useState(null);
  const [sentFor, setSentFor] = useState(null);

  const handleRequest = async (planId) => {
    const token = localStorage.getItem("token");
    setRequesting(planId);

    try {
      const response = await fetch("http://localhost:8080/account/bucket-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ size: planId }),
      });
      const result = await response.json();

      if (response.ok) {
        toast.success("Request has been sent to admin!");
        setSentFor(planId);
      } else if (response.status === 409) {
        toast.info(result.message || "Request already pending with admin.");
        setSentFor(planId);
      } else {
        toast.error(result.message || "Could not send request");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while sending the request");
    } finally {
      setRequesting(null);
    }
  };

  return (
    <div className="bg-[#0d0d0e] min-h-screen flex flex-col">
      <div className="px-10 pt-8">
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-10 py-12">
        <div className="max-w-2xl text-center">
          <h1 className="text-white text-5xl font-bold">Request a new bucket</h1>
          <p className="text-white/40 mt-4 text-lg">
            Pick how much extra storage you need. Your request goes straight to the admin for approval.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14 w-full max-w-6xl">
          {plans.map((plan) => {
            const isSent = sentFor === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative bg-[#19191a] border rounded-2xl p-9 flex flex-col ${
                  plan.highlighted ? "border-[#6245F5]/60 md:scale-105" : "border-white/10"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-9 bg-[#6245F5] text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Popular
                  </span>
                )}

                <div className={`w-14 h-14 rounded-xl ${plan.bg} flex items-center justify-center mb-6`}>
                  <Database size={26} className={plan.color} />
                </div>

                <h2 className="text-white text-3xl font-bold">{plan.title}</h2>
                <p className="text-white/40 text-sm mt-1">{plan.tagline}</p>

                <ul className="mt-7 flex flex-col gap-4 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-white/70 text-sm">
                      <Check size={16} className={plan.color} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleRequest(plan.id)}
                  disabled={requesting === plan.id || isSent}
                  className={`mt-9 w-full py-3.5 rounded-xl font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed ${
                    plan.highlighted
                      ? "bg-[#6245F5] text-white hover:bg-[#5539e8]"
                      : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                  }`}
                >
                  {isSent
                    ? "Request sent ✓"
                    : requesting === plan.id
                    ? "Sending..."
                    : "Request this bucket"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
