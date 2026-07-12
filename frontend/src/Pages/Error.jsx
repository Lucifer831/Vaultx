import React from "react";
import { useNavigate } from "react-router-dom";

export default function Error() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#090a09] min-h-screen flex justify-center items-center px-6">
      <div className="text-center">

        <h1 className="text-[180px] font-extrabold text-white leading-none">
          404
        </h1>

        <h2 className="text-5xl font-bold text-white mt-2">
          Page Not Found
        </h2>

        <p className="text-gray-500 mt-4 max-w-xl mx-auto text-lg">
          Don't worry, you can head back to the homepage or use the navigation
          menu to find what you need.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-7 py-3 border rounded-xl text-slate-70 bg-gray-100 transition"
          >
            ← Go back
          </button>

          <button
            onClick={() => navigate("/home")}
            className="px-7 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}