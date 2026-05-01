"use client";

export default function FileManagerControls({ 
  currentPath, 
  onBack, 
  itemCount, 
  viewMode, 
  onViewModeChange, 
  onNewFolder, 
  onFileUpload, 
  uploading 
}) {
  return (
    <>
      {currentPath && (
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={onBack}
            className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-secondary text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-secondary/80 transition-colors text-sm font-medium shadow-sm"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-foreground dark:text-white">
            {itemCount} items
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-secondary rounded-lg p-1">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "grid" 
                ? "bg-white dark:bg-card text-blue-600 dark:text-blue-400 shadow-sm" 
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "list" 
                ? "bg-white dark:bg-card text-blue-600 dark:text-blue-400 shadow-sm" 
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <label className="cursor-pointer">
          <input
            type="file"
            onChange={onFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <div className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-md font-medium hover:bg-green-700 dark:hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center gap-2">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload File
              </>
            )}
          </div>
        </label>
        <button
          onClick={onNewFolder}
          className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Folder
        </button>
      </div>
    </>
  );
} 