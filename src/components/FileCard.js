"use client";
import { useState, useRef } from "react";

export default function FileCard({
  file,
  onDownload,
  onDelete,
  onMove,
  onSummarize,
  getFileIcon,
  onDragStart,
  onSelect,
  isSelected,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  function handleBlur(e) {
    if (!menuRef.current?.contains(e.relatedTarget)) {
      setMenuOpen(false);
    }
  }

  return (
    <div
      className={`group p-4 bg-card dark:bg-card border border-border dark:border-border rounded-lg shadow hover:shadow-lg hover:border-green-300 dark:hover:border-green-400 hover:scale-[1.03] transition-all duration-200 relative dark:hover:bg-secondary/60 ${
        isSelected ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""
      }`}
      tabIndex={0}
      onBlur={handleBlur}
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, file)}
      style={{ cursor: "grab" }}
    >
      <div className="absolute top-2 left-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(file)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div className="flex items-center gap-3 mb-3 mt-4">
        <div className="flex items-center justify-center">
          <span className="text-lg text-green-600 dark:text-green-400">
            {getFileIcon(file.name)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground dark:text-white truncate">
            {file.name}
          </p>
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            {file.size}
          </p>
        </div>
        <div className="relative z-10">
          <button
            type="button"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-secondary/70 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            aria-label="File actions"
            tabIndex={0}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="5" cy="12" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-2 w-32 bg-card dark:bg-secondary border border-border dark:border-border rounded-lg shadow-xl py-1 z-50"
            >
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-secondary/70 text-purple-600 dark:text-purple-400"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onSummarize(file);
                }}
              >
                AI Summary
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-secondary/70 text-gray-700 dark:text-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onMove(file);
                }}
              >
                Move
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-secondary/70 text-blue-600 dark:text-blue-400"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDownload(file);
                }}
              >
                Download
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-secondary/70 text-red-600 dark:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete(file);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground dark:text-gray-400 mb-3">
        <span>Modified: {file.lastModified}</span>
      </div>
    </div>
  );
}
