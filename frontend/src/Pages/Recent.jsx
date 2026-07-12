import React from "react";
import { Clock } from "lucide-react";

export default function Recent({ isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full h-[55px] rounded-[24px] flex items-center gap-4 px-5 transition ${
        isActive ? "bg-[#6245F5] hover:bg-[#5539e8]" : "hover:bg-white/10"
      }`}
    >
      <Clock className="text-white" size={22} />
      <span className="text-white text-lg font-semibold">Recent</span>
    </button>
  );
}
