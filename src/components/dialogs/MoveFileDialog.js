"use client";
import { useState, useEffect } from "react";

export default function MoveFileDialog({ open, onClose, onMove, file, folders, currentPath }) {
  const [selectedFolder, setSelectedFolder] = useState("");

  useEffect(() => { 
    setSelectedFolder(""); 
  }, [open]);

  if (!open || !file) return null;

  const availableFolders = folders.filter(folder => {
    const filePath = file.key;
    const folderPath = folder.key;
    const lastSlashIndex = filePath.lastIndexOf('/');
    const fileDirectory = lastSlashIndex >= 0 ? filePath.substring(0, lastSlashIndex + 1) : '';
    if (folderPath === filePath) return false;
    return true;
  });

  const formatFolderName = (folderKey) => {
    if (!folderKey) return "Root";
    
    const cleanKey = folderKey.replace(/\/$/, '');
    const parts = cleanKey.split('/');
    const folderName = parts[parts.length - 1];
    return folderKey === folderName ? folderName : `${folderName} (${cleanKey})`;
  };

  const handleMove = () => {
    onMove(selectedFolder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/60">
      <div className="bg-card dark:bg-card rounded-xl shadow-xl max-w-md w-full p-6 relative animate-fade-in border border-border dark:border-border">
        <h2 className="text-lg font-semibold text-foreground dark:text-white mb-2">Move File</h2>
        <p className="text-foreground dark:text-gray-300 mb-4 text-sm break-words">
          Select destination folder for <span className="font-mono text-blue-700 dark:text-blue-400">{file.name}</span>
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground dark:text-white mb-2">
            Destination Folder
          </label>
          <select
            className="w-full px-3 py-2 border border-border dark:border-border rounded-md bg-background dark:bg-background text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
            value={selectedFolder}
            onChange={e => setSelectedFolder(e.target.value)}
          >
            <option value="">📁 Root (Bucket Level)</option>
            {availableFolders.map(folder => (
              <option key={folder.key} value={folder.key}>
                📁 {formatFolderName(folder.key)}
              </option>
            ))}
          </select>
        </div>

        {availableFolders.length === 0 && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              No other folders available. You can only move to root level.
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Available destinations: {availableFolders.length + 1} (including root)
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-muted dark:bg-secondary text-foreground dark:text-gray-200 hover:bg-muted/80 dark:hover:bg-secondary/70 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            className="px-4 py-2 rounded-md bg-blue-600 dark:bg-blue-500 text-white dark:text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold"
          >
            Move
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