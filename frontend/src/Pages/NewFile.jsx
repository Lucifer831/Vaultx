import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { API_URL } from "../utils/api";

export default function NewFile() {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleNewFileClick = () => {
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
      const response = await fetch(`${API_URL}/upload`, {
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
    <div className="px-6 flex">

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={handleNewFileClick}
        disabled={uploading}
        className="w-[250px] h-[65px] bg-[#6245F5] rounded-[24px] flex items-center justify-center gap-6 hover:bg-[#5539e8] transition disabled:opacity-50"
      >

        <span className="text-white text-3xl font-light">
          {uploading ? "" : "+"}
        </span>
        <span className="text-white text-3xl font-semibold">
          {uploading ? "Uploading..." : "New File"}
        </span>

      </button>
    </div>
  );
}