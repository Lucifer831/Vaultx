import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import vault from "/vault1.png";
import addterm from "/addterm.svg";
import { toast } from "react-toastify";

export default function Header({ searchQuery = "", onSearchChange = () => {} }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const termsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (termsRef.current && !termsRef.current.contains(e.target)) {
        setShowTerms(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out");
    navigate("/");
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");

    try {
      setUploading(true);
      const response = await fetch("http://localhost:8080/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("File uploaded successfully!");
        window.dispatchEvent(new Event("file-uploaded"));
      } else {
        toast.error(result.message || "Upload failed");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while uploading");
    } finally {
      setUploading(false);
      e.target.value = ""; 
    }
  };

  return (
    <nav className="bg-[#161617] h-[80px] px-8 flex items-center justify-between shadow">

      {/* Logo */}
      <div className="flex items-center gap-3">
        <img
          src={vault}
          alt="Logo"
          className="w-[255px] h-[105px]"
        />

      </div>

      {/* Search Bar */}
      <div className="flex-1 flex justify-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="🔍 Search your file"
          className="w-[600px] h-[50px] text-white px-6 border bg-[#1c1b1c] border-gray-300 rounded-full outline-none placeholder:text-white"
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-5">
        <div className="relative" ref={termsRef}>
          <img
            src={addterm}
            onClick={() => setShowTerms((prev) => !prev)}
            className="cursor-pointer"
          />

          {showTerms && (
            <div className="absolute right-0 top-[45px] w-[320px] bg-[#1c1b1c] border border-white/10 rounded-2xl shadow-lg p-5 z-50 text-sm">
              <h3 className="text-white font-semibold mb-3">Terms & Conditions</h3>
              <ul className="text-white/60 space-y-2 list-disc list-inside">
                <li>Each account gets 1GB of storage. Uploads are blocked once the limit is reached.</li>
                <li>Don't upload illegal, harmful, or copyrighted content you don't own.</li>
                <li>Keep your login credentials private — you're responsible for your account's activity.</li>
                <li>VaultX is a personal project; files aren't guaranteed to be backed up, so keep your own copies of anything important.</li>
                <li>Trashed files still count toward your storage until permanently deleted.</li>
              </ul>
              <button
                onClick={() => setShowTerms(false)}
                className="mt-4 w-full bg-[#6245F5] text-white py-2 rounded-full text-sm"
              >
                Got it
              </button>
            </div>
          )}
        </div>

        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={handleUploadClick}
          disabled={uploading}
          className="bg-pink-500 text-white px-6 py-2 rounded-full disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

        <button onClick={handleLogout} className="bg-red-500 w-[80px] h-[40px] rounded-2xl">Logout</button>
      </div>

    </nav>
  );
}