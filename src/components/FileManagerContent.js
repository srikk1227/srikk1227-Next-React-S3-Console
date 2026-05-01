"use client";
import { useRef, useCallback } from "react";
import FileCard from "./FileCard";
import FileRow from "./FileRow";
import FolderCard from "./FolderCard";
import FolderRow from "./FolderRow";
import LoadingSpinner from "./LoadingSpinner";

export default function FileManagerContent({
  viewMode,
  filteredFolders,
  filteredFiles,
  loading,
  search,
  currentPath,
  onFolderClick,
  onFileDownload,
  onFileDelete,
  onFileMove,
  onFileSummarize,
  onFolderRename,
  onFolderDelete,
  onFolderDropFile,
  onFileDragStart,
  getFileIcon,
  selectedItems,
  onItemSelect,
  // Performance props
  hasMoreFiles,
  isLoadingMore,
  loadMoreFiles,
  totalFiles,
  isSearching,
}) {
  const observerRef = useRef();
  const loadingRef = useRef();

  // Infinite scroll callback
  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreFiles && !isLoadingMore) {
        loadMoreFiles();
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loading, hasMoreFiles, isLoadingMore, loadMoreFiles]);

  // Performance indicator
  const getPerformanceInfo = () => {
    if (search) {
      return `Search results: ${filteredFiles.length} files`;
    }
    return `Showing ${filteredFiles.length} of ${totalFiles} files`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (filteredFolders.length === 0 && filteredFiles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-lg font-semibold text-foreground dark:text-white mb-2">
          {search ? "No files found" : "No files in this folder"}
        </h3>
        <p className="text-muted-foreground">
          {search 
            ? "Try adjusting your search terms" 
            : "Upload some files or create a folder to get started"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance indicator */}
      <div className="text-sm text-muted-foreground flex items-center justify-between">
        <span>{getPerformanceInfo()}</span>
        {isSearching && (
          <span className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            Searching...
          </span>
        )}
      </div>

      {viewMode === "grid" ? (
        <>
          {filteredFolders.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground dark:text-white mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                Folders ({filteredFolders.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredFolders.map((folder) => (
                  <FolderCard
                    key={folder.key}
                    folder={folder}
                    onClick={onFolderClick}
                    onRename={onFolderRename}
                    onDelete={onFolderDelete}
                    onDropFile={onFolderDropFile}
                  />
                ))}
              </div>
            </div>
          )}
          {filteredFiles.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground dark:text-white mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400"
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
                Files ({filteredFiles.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredFiles.map((file, index) => (
                  <div
                    key={file.key}
                    ref={index === filteredFiles.length - 1 ? lastElementRef : null}
                  >
                    <FileCard
                      file={file}
                      onDownload={onFileDownload}
                      onDelete={onFileDelete}
                      onMove={onFileMove}
                      onSummarize={onFileSummarize}
                      getFileIcon={getFileIcon}
                      onDragStart={(e) => onFileDragStart(e, file)}
                      onSelect={onItemSelect}
                      isSelected={selectedItems.some(
                        (item) => item.key === file.key
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {filteredFolders.length > 0 && (
            <div className="bg-card border border-border rounded-lg overflow-hidden dark:bg-card dark:border-border">
              {filteredFolders.map((folder, index) => (
                <FolderRow
                  key={folder.key}
                  folder={folder}
                  onClick={onFolderClick}
                  isLast={index === filteredFolders.length - 1}
                />
              ))}
            </div>
          )}
          {filteredFiles.length > 0 && (
            <div className="bg-card border border-border rounded-lg overflow-hidden dark:bg-card dark:border-border">
              {filteredFiles.map((file, index) => (
                <div
                  key={file.key}
                  ref={index === filteredFiles.length - 1 ? lastElementRef : null}
                >
                  <FileRow
                    file={file}
                    onDownload={onFileDownload}
                    onDelete={onFileDelete}
                    onMove={onFileMove}
                    onSummarize={onFileSummarize}
                    getFileIcon={getFileIcon}
                    isLast={index === filteredFiles.length - 1}
                    onSelect={onItemSelect}
                    isSelected={selectedItems.some(
                      (item) => item.key === file.key
                    )}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="flex items-center justify-center py-4">
          <LoadingSpinner size="md" />
          <span className="ml-2 text-muted-foreground">Loading more files...</span>
        </div>
      )}

      {/* End of results indicator */}
      {!hasMoreFiles && filteredFiles.length > 0 && !search && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          You've reached the end of the file list
        </div>
      )}
    </div>
  );
}
