import React, { useState } from "react";
import { FileText, X } from "lucide-react";

export default function TermsAndConditions() {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowTerms(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition text-sm font-semibold"
      >
        <FileText size={16} />
        Terms &amp; Conditions
      </button>

      {showTerms && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowTerms(false)}
        >
          <div
            className="bg-[#19191a] border border-white/10 rounded-2xl w-full max-w-md p-6 relative max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTerms(false)}
              className="absolute right-5 top-5 text-white/40 hover:text-white transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-[#6245F5]/15 flex items-center justify-center shrink-0">
                <FileText className="text-[#8b7cf6]" size={20} />
              </div>
              <h2 className="text-white text-xl font-bold">Terms &amp; Conditions</h2>
            </div>

            <ul className="text-white/60 text-sm space-y-3 list-disc list-inside">
              <li>Each account gets 1GB of storage. Uploads are blocked once the limit is reached.</li>
              <li>Don't upload illegal, harmful, or copyrighted content you don't own.</li>
              <li>Keep your login credentials private — you're responsible for your account's activity.</li>
              <li>VaultX is a personal project; files aren't guaranteed to be backed up, so keep your own copies of anything important.</li>
              <li>Trashed files still count toward your storage until permanently deleted.</li>
            </ul>

            <button
              onClick={() => setShowTerms(false)}
              className="mt-6 w-full bg-[#6245F5] hover:bg-[#5539e8] text-white py-3 rounded-xl font-semibold transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
