"use client";
import { useState, useEffect } from "react";

export default function NewFolderDialog({ open, onClose, onCreate, error: parentError }) {
  const [folderName, setFolderName] = useState("");
  const [localError, setLocalError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (open) {
      setFolderName("");
      setLocalError("");
      setIsCreating(false);
    }
  }, [open]);

  const handleCreate = async () => {
    if (!folderName.trim()) {
      setLocalError("Folder name cannot be empty");
      return;
    }
    
    setIsCreating(true);
    setLocalError("");
    
    try {
      await onCreate(folderName.trim());
    } catch (error) {
      setLocalError(error.message || "Failed to create folder");
    } finally {
      setIsCreating(false);
    }
  };

  const displayError = parentError || localError;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/60">
      <div className="bg-card dark:bg-card rounded-xl shadow-xl max-w-sm w-full p-6 relative animate-fade-in border border-border dark:border-border">
        <h2 className="text-lg font-semibold text-foreground dark:text-white mb-2">Create New Folder</h2>
        <input
          type="text"
          value={folderName}
          onChange={e => setFolderName(e.target.value)}
          placeholder="Folder name"
          className="w-full px-3 py-2 border border-border dark:border-border rounded-md mb-3 bg-background dark:bg-background text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
          autoFocus
          disabled={isCreating}
        />
        {displayError && <p className="text-red-600 dark:text-red-400 text-sm mb-2">{displayError}</p>}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-muted dark:bg-secondary text-foreground dark:text-gray-200 hover:bg-muted/80 dark:hover:bg-secondary/70 transition-colors"
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="px-4 py-2 rounded-md bg-blue-600 dark:bg-blue-500 text-white dark:text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "Create"}
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