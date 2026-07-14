import React, { useState } from "react";
import { Trash } from "lucide-react";
import NewFile from "./NewFile";
import Mydrive from "./Mydrive";
import Recent from "./Recent";
import Starred from "./Starred";
import TrashNav from "./Trash";
import ActiveLinksNav from "./ActiveLinksNav";
import StorageBar from "./StorageBar";
import DeleteAccountModal from "../Component/DeleteAccountModal";
import TermsAndConditions from "../Component/TermsAndConditions";

export default function Mainleft({ activeView, setActiveView }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="w-full h-full bg-[#1c1b1c] flex flex-col py-6">
      <NewFile />

      <div className="flex flex-col gap-2 px-6 mt-6">
        <Mydrive isActive={activeView === "drive"} onClick={() => setActiveView("drive")} />
        <Recent isActive={activeView === "recent"} onClick={() => setActiveView("recent")} />
        <Starred isActive={activeView === "starred"} onClick={() => setActiveView("starred")} />
        <ActiveLinksNav isActive={activeView === "links"} onClick={() => setActiveView("links")} />
        <TrashNav isActive={activeView === "trash"} onClick={() => setActiveView("trash")} />
      </div>

      <StorageBar />

      <div className="px-6 mt-auto pt-6 flex flex-col gap-3">
        <TermsAndConditions />

        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition text-sm font-semibold"
        >
          <Trash size={16} />
          Delete Account
        </button>
      </div>

      {showDeleteModal && <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />}
    </div>
  );
}
