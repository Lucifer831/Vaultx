import React from "react";
import NewFile from "./NewFile";
import Mydrive from "./Mydrive";
import Recent from "./Recent";
import Starred from "./Starred";
import Trash from "./Trash";
import StorageBar from "./StorageBar";

export default function Mainleft({ activeView, setActiveView }) {
  return (
    <div className="w-full h-full bg-[#1c1b1c] flex flex-col py-6">
      <NewFile />

      <div className="flex flex-col gap-2 px-6 mt-6">
        <Mydrive isActive={activeView === "drive"} onClick={() => setActiveView("drive")} />
        <Recent isActive={activeView === "recent"} onClick={() => setActiveView("recent")} />
        <Starred isActive={activeView === "starred"} onClick={() => setActiveView("starred")} />
        <Trash isActive={activeView === "trash"} onClick={() => setActiveView("trash")} />
      </div>

      <StorageBar />
    </div>
  );
}
