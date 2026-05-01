"use client";
import { useState, useEffect } from "react";

export default function RenameFolderDialog({ open, onClose, onRename, initialName }) {
  const [folderName, setFolderName] = useState(initialName || "");
  const [error, setError] = useState("");

  useEffect(() => { 
    setFolderName(initialName || ""); 
    setError(""); 
  }, [open, initialName]);

  const handleRename = () => {
    if (!folderName.trim()) {
      setError("Folder name cannot be empty");
      return;
    }
    onRename(folderName.trim());
    setFolderName("");
    setError("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/60">
      <div className="bg-card dark:bg-card rounded-xl shadow-xl max-w-sm w-full p-6 relative animate-fade-in border border-border dark:border-border">
        <h2 className="text-lg font-semibold text-foreground dark:text-white mb-2">Rename Folder</h2>
        <input
          type="text"
          value={folderName}
          onChange={e => setFolderName(e.target.value)}
          placeholder="New folder name"
          className="w-full px-3 py-2 border border-border dark:border-border rounded-md mb-3 bg-background dark:bg-background text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
          autoFocus
        />
        {error && <p className="text-red-600 dark:text-red-400 text-sm mb-2">{error}</p>}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-muted dark:bg-secondary text-foreground dark:text-gray-200 hover:bg-muted/80 dark:hover:bg-secondary/70 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRename}
            className="px-4 py-2 rounded-md bg-blue-600 dark:bg-blue-500 text-white dark:text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold"
          >
            Rename
          </button>
        </div>
      </div>
      <style jsx>{`
        .animate-fade-in { animation: fadeIn 0.15s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
} 