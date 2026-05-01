"use client";
import { useState, useRef } from "react";

export default function FolderCard({ folder, onClick, onRename, onDelete, onDropFile }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const menuRef = useRef(null);

  function handleBlur(e) {
    if (!menuRef.current?.contains(e.relatedTarget)) {
      setMenuOpen(false);
    }
  }

  return (
    <div
      className={`group p-4 bg-card dark:bg-card border border-border dark:border-border rounded-lg shadow hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-400 hover:scale-[1.03] cursor-pointer transition-all duration-200 relative ${dragOver ? "ring-2 ring-blue-400 dark:ring-blue-500" : ""} dark:hover:bg-secondary/60`}
      onClick={() => onClick(folder)}
      tabIndex={0}
      onBlur={handleBlur}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { setDragOver(false); if (onDropFile) { const fileData = e.dataTransfer.getData("application/json"); if (fileData) onDropFile(JSON.parse(fileData), folder); } }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{folder.name}</p>
          <p className="text-sm text-muted-foreground dark:text-gray-400">Folder</p>
        </div>
        <div className="relative z-10">
          <button
            type="button"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-secondary/70 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white focus:outline-none"
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
            aria-label="Folder actions"
            tabIndex={0}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <div ref={menuRef} className="absolute right-0 mt-2 w-32 bg-card dark:bg-secondary border border-border dark:border-border rounded-lg shadow-xl py-1 z-50">
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-secondary/70 text-gray-700 dark:text-gray-200"
                onClick={e => { e.stopPropagation(); setMenuOpen(false); onRename(folder); }}
              >Rename</button>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-secondary/70 text-red-600 dark:text-red-400"
                onClick={e => { e.stopPropagation(); setMenuOpen(false); onDelete(folder); }}
              >Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 