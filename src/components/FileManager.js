"use client";
import { useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import FileManagerHeader from "@/components/FileManagerHeader";
import FileManagerControls from "@/components/FileManagerControls";
import FileManagerContent from "@/components/FileManagerContent";
import NewFolderDialog from "@/components/dialogs/NewFolderDialog";
import RenameFolderDialog from "@/components/dialogs/RenameFolderDialog";
import MoveFileDialog from "@/components/dialogs/MoveFileDialog";
import FileSummaryDialog from "@/components/FileSummaryDialog";
import { useFileManager } from "@/hooks/useFileManager";
import { useFileManagerDialogs } from "@/hooks/useFileManagerDialogs";
import BulkActionsToolbar from "@/components/BulkActionsToolbar";

export default function FileManager({ awsConfig, onDisconnect }) {
  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [summaryDialog, setSummaryDialog] = useState({ open: false, file: null });

  // Custom hooks
  const {
    files,
    folders,
    currentPath,
    loading,
    uploading,
    error,
    allFolders,
    // Performance state
    currentPage,
    hasMoreFiles,
    isLoadingMore,
    totalFiles,
    searchQuery,
    searchResults,
    isSearching,
    handleFileUpload,
    handleFileDownload,
    handleFileDelete,
    handleCreateFolder,
    handleRenameFolder,
    handleDeleteFolder,
    handleFolderClick,
    handleBackToRoot,
    handleBack,
    moveFileToFolder,
    openMoveDialog,
    handleFileDragStart,
    handleFolderDropFile,
    // Performance actions
    loadMoreFiles,
    handleSearch,
    setError,
  } = useFileManager(awsConfig);

  const {
    deleteDialog,
    newFolderOpen,
    renameDialog,
    deleteFolderDialog,
    moveDialog,
    bulkDeleteDialog,
    openDeleteDialog,
    closeDeleteDialog,
    openBulkDeleteDialog,
    closeBulkDeleteDialog,
    openNewFolderDialog,
    closeNewFolderDialog,
    openRenameDialog,
    closeRenameDialog,
    openDeleteFolderDialog,
    closeDeleteFolderDialog,
    openMoveDialog: openMoveDialogState,
    closeMoveDialog,
  } = useFileManagerDialogs();

  // Use search from the hook instead of local state
  const handleSearchChange = (newSearch) => {
    setSearch(newSearch);
    handleSearch(newSearch);
  };

  // Filter files and folders based on search
  const filteredFolders = search
    ? folders.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : folders;
  const filteredFiles = search
    ? files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : files;

  // Enhanced handlers
  const handleFileDeleteWithDialog = (file) => {
    openDeleteDialog(file);
  };

  const confirmDelete = async () => {
    if (deleteDialog.file) {
      await handleFileDelete(deleteDialog.file);
      closeDeleteDialog();
    }
  };

  const handleFolderRenameWithDialog = (folder) => {
    openRenameDialog(folder);
  };

  const handleFolderDeleteWithDialog = (folder) => {
    openDeleteFolderDialog(folder);
  };

  const handleFolderDeleteConfirm = async () => {
    if (deleteFolderDialog.folder) {
      await handleDeleteFolder(deleteFolderDialog.folder);
      closeDeleteFolderDialog();
    }
  };

  const handleFileMoveWithDialog = async (file) => {
    try {
      await openMoveDialog(file);
      openMoveDialogState(file);
    } catch (error) {
      setError('Failed to load folder list for move operation');
    }
  };

  const handleFileSummarize = (file) => {
    setSummaryDialog({ open: true, file });
  };

  const handleCloseSummaryDialog = () => {
    setSummaryDialog({ open: false, file: null });
  };

  const handleMoveFile = async (destFolderKey) => {
    if (moveDialog.file) {
      try {
        if (moveDialog.file.__bulkMove) {
          const filesToMove = moveDialog.file.__bulkMove;
          
          await Promise.all(
            filesToMove.map((file) => moveFileToFolder(file, destFolderKey))
          );
          setSelectedItems([]); 
          setError(""); 
        } else {
          await moveFileToFolder(moveDialog.file, destFolderKey);
        }
        closeMoveDialog();
      } catch (err) {
        setError("Failed to move file(s). Please try again.");
      }
    }
  };

  const getFileIcon = () => "📄";

  const handleItemSelect = (item) => {
    setSelectedItems((prev) =>
      prev.some((i) => i.key === item.key)
        ? prev.filter((i) => i.key !== item.key)
        : [...prev, item]
    );
  };

  const handleBulkDelete = () => {
    openBulkDeleteDialog(selectedItems);
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(
        bulkDeleteDialog.items.map((item) => handleFileDelete(item))
      );
      setSelectedItems([]);
      setError("");
    } catch (err) {
      setError("Failed to delete some items");
    } finally {
      closeBulkDeleteDialog();
    }
  };

  const handleBulkDownload = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch("/api/s3/bulk-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          awsConfig,
          keys: selectedItems.map((file) => file.key),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Download failed");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a download link and trigger it
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `s3web-files-${new Date()
        .toISOString()
        .slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Bulk download error:", err);
      setError("Failed to download files: " + (err.message || "Unknown error"));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileManagerHeader
        awsConfig={awsConfig}
        onDisconnect={onDisconnect}
        search={search}
        onSearchChange={handleSearchChange}
      />

      <FileManagerControls
        currentPath={currentPath}
        onBack={handleBack}
        itemCount={filteredFolders.length + filteredFiles.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNewFolder={openNewFolderDialog}
        onFileUpload={handleFileUpload}
        uploading={uploading}
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      <FileManagerContent
        viewMode={viewMode}
        filteredFolders={filteredFolders}
        filteredFiles={filteredFiles}
        loading={loading}
        search={search}
        currentPath={currentPath}
        onFolderClick={handleFolderClick}
        onFileDownload={handleFileDownload}
        onFileDelete={handleFileDeleteWithDialog}
        onFileMove={handleFileMoveWithDialog}
        onFileSummarize={handleFileSummarize}
        onFolderRename={handleFolderRenameWithDialog}
        onFolderDelete={handleFolderDeleteWithDialog}
        onFolderDropFile={handleFolderDropFile}
        onFileDragStart={handleFileDragStart}
        getFileIcon={getFileIcon}
        selectedItems={selectedItems}
        onItemSelect={handleItemSelect}
        // Pass performance state and actions to FileManagerContent
        currentPage={currentPage}
        hasMoreFiles={hasMoreFiles}
        isLoadingMore={isLoadingMore}
        totalFiles={totalFiles}
        searchQuery={searchQuery}
        searchResults={searchResults}
        isSearching={isSearching}
        loadMoreFiles={loadMoreFiles}
      />

      {/* Dialogs */}
      <NewFolderDialog
        open={newFolderOpen}
        onClose={closeNewFolderDialog}
        onCreate={(folderName) => handleCreateFolder(folderName, closeNewFolderDialog)}
        error={error}
      />

      <RenameFolderDialog
        open={renameDialog.open}
        onClose={closeRenameDialog}
        onRename={handleRenameFolder}
        initialName={renameDialog.folder?.name}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete File?"
        description={
          deleteDialog.file
            ? `Are you sure you want to delete this file? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={closeDeleteDialog}
        fileName={deleteDialog.file?.name}
      />

      <ConfirmDialog
        open={deleteFolderDialog.open}
        title="Delete Folder?"
        description={
          deleteFolderDialog.folder
            ? `Are you sure you want to delete the folder "${deleteFolderDialog.folder.name}" and all its contents? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleFolderDeleteConfirm}
        onCancel={closeDeleteFolderDialog}
        fileName={deleteFolderDialog.folder?.name}
      />

      <ConfirmDialog
        open={bulkDeleteDialog.open}
        title="Delete Multiple Items?"
        description={`Are you sure you want to delete ${bulkDeleteDialog.items.length} items? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        onConfirm={confirmBulkDelete}
        onCancel={closeBulkDeleteDialog}
      />

      <MoveFileDialog
        open={moveDialog.open}
        onClose={closeMoveDialog}
        onMove={handleMoveFile}
        file={moveDialog.file}
        folders={allFolders}
        currentPath={currentPath}
      />
      {moveDialog.open}

      <BulkActionsToolbar
        selectedItems={selectedItems}
        onBulkDelete={handleBulkDelete}
        onBulkDownload={handleBulkDownload}
        isDownloading={isDownloading}
        onBulkMove={async () => {
          // Open move dialog with the first file but store all selected items
          const firstFile = selectedItems[0];
          if (firstFile) {
            handleFileMoveWithDialog({
              ...firstFile,
              // Add a custom property to indicate this is a bulk move
              __bulkMove: selectedItems,
            });
          }
        }}
      />

      <FileSummaryDialog
        isOpen={summaryDialog.open}
        onClose={handleCloseSummaryDialog}
        file={summaryDialog.file}
        awsConfig={awsConfig}
        getFileIcon={getFileIcon}
      />
    </div>
  );
}
