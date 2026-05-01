import { useState } from "react";

export function useFileManagerDialogs() {
  const [deleteDialog, setDeleteDialog] = useState({ open: false, file: null });
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [renameDialog, setRenameDialog] = useState({
    open: false,
    folder: null,
  });
  const [deleteFolderDialog, setDeleteFolderDialog] = useState({
    open: false,
    folder: null,
  });
  const [moveDialog, setMoveDialog] = useState({ open: false, file: null });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState({
    open: false,
    items: [],
  });

  const openBulkDeleteDialog = (items) => {
    setBulkDeleteDialog({ open: true, items });
  };

  const closeBulkDeleteDialog = () => {
    setBulkDeleteDialog({ open: false, items: [] });
  };

  const openDeleteDialog = (file) => {
    setDeleteDialog({ open: true, file });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, file: null });
  };

  const openNewFolderDialog = () => {
    setNewFolderOpen(true);
  };

  const closeNewFolderDialog = () => {
    setNewFolderOpen(false);
  };

  const openRenameDialog = (folder) => {
    setRenameDialog({ open: true, folder });
  };

  const closeRenameDialog = () => {
    setRenameDialog({ open: false, folder: null });
  };

  const openDeleteFolderDialog = (folder) => {
    setDeleteFolderDialog({ open: true, folder });
  };

  const closeDeleteFolderDialog = () => {
    setDeleteFolderDialog({ open: false, folder: null });
  };

  const openMoveDialog = (file) => {
    setMoveDialog({ open: true, file });
  };

  const closeMoveDialog = () => {
    setMoveDialog({ open: false, file: null });
  };

  return {
    // Dialog states
    deleteDialog,
    newFolderOpen,
    renameDialog,
    deleteFolderDialog,
    moveDialog,
    bulkDeleteDialog,

    // Dialog actions
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
    openMoveDialog,
    closeMoveDialog,
  };
}
