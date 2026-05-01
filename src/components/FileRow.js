"use client";

export default function FileRow({
  file,
  onDownload,
  onDelete,
  onMove,
  onSummarize,
  getFileIcon,
  isLast,
  onSelect,
  isSelected,
}) {
  return (
    <div
      className={`flex items-center gap-4 p-4 bg-card dark:bg-card hover:bg-muted dark:hover:bg-secondary/60 transition-all duration-150 ${
        !isLast ? "border-b border-border dark:border-border" : ""
      } ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""} relative`}
      tabIndex={0}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(file)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          onClick={(e) => e.stopPropagation()}
        />
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
          <span className="text-lg text-green-600 dark:text-green-400">
            {getFileIcon(file.name)}
          </span>
        </div>
        <span className="text-lg text-green-600 dark:text-green-400">
          {getFileIcon(file.name)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground dark:text-white">
          {file.name}
        </p>
        <p className="text-sm text-muted-foreground dark:text-gray-400">
          {file.size} • Modified: {file.lastModified}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onDownload(file)}
          className="p-2 text-gray-600 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-md transition-colors"
          title="Download"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>
        <button
          onClick={() => onDelete(file)}
          className="p-2 text-gray-600 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors"
          title="Delete"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
        <button
          onClick={() => onMove(file)}
          className="p-2 text-gray-600 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-md transition-colors"
          title="Move"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        </button>
        <button
          onClick={() => onSummarize(file)}
          className="p-2 text-gray-600 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900 rounded-md transition-colors"
          title="Summarize"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
