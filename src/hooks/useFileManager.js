import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

export function useFileManager(awsConfig) {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [currentPath, setCurrentPath] = useState("");
  const [allFolders, setAllFolders] = useState([]);
  
  // Performance optimizations
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreFiles, setHasMoreFiles] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalFiles, setTotalFiles] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const FILES_PER_PAGE = 100; // Optimize for performance

  // Load bucket contents with pagination
  const loadBucketContents = async (page = 1, append = false) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      const response = await fetch('/api/s3/list-objects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...awsConfig, 
          prefix: currentPath,
          page,
          limit: FILES_PER_PAGE
        }),
      });
      const result = await response.json();
      if (result.success) {
        const uniqueFolders = result.folders.filter((folder, index, self) => 
          index === self.findIndex(f => f.key === folder.key)
        );
        
        if (append) {
          setFolders(prev => [...prev, ...uniqueFolders]);
          setFiles(prev => [...prev, ...result.files]);
        } else {
          setFolders(uniqueFolders);
          setFiles(result.files);
        }
        
        setTotalFiles(result.totalFiles || result.files.length);
        setHasMoreFiles(result.hasMore || result.files.length === FILES_PER_PAGE);
        setCurrentPage(page);
        setError("");
      } else {
        setError(result.error);
        if (!append) {
          setFolders([]);
          setFiles([]);
        }
      }
    } catch (err) {
      setError("Failed to load bucket contents");
      if (!append) {
        setFolders([]);
        setFiles([]);
      }
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Load more files (for infinite scroll)
  const loadMoreFiles = async () => {
    if (!hasMoreFiles || isLoadingMore) return;
    await loadBucketContents(currentPage + 1, true);
  };

  // Efficient search with debouncing
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      
      setIsSearching(true);
      try {
        const response = await fetch('/api/s3/search-files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ...awsConfig, 
            query: query.trim(),
            prefix: currentPath
          }),
        });
        const result = await response.json();
        if (result.success) {
          setSearchResults(result.files);
        } else {
          setSearchResults([]);
          setError(result.error);
        }
      } catch (err) {
        setSearchResults([]);
        setError('Search failed. Please try again.');
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [awsConfig, currentPath]
  );

  // Handle search input
  const handleSearch = (query) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Get current files to display (search results or paginated files)
  const getDisplayFiles = () => {
    if (searchQuery.trim()) {
      return searchResults;
    }
    return files;
  };

  // Reset pagination when path changes
  useEffect(() => {
    setCurrentPage(1);
    setHasMoreFiles(true);
    setSearchQuery("");
    setSearchResults([]);
    loadBucketContents(1, false);
  }, [awsConfig, currentPath]);

  // File operations
  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('awsConfig', JSON.stringify(awsConfig));
      formData.append('prefix', currentPath);
      const response = await fetch('/api/s3/upload', { method: 'POST', body: formData });
      const result = await response.json();
      if (result.success) {
        setFiles(prev => [...prev, {
          name: result.name,
          key: result.key,
          size: result.size,
          lastModified: result.lastModified,
          type: 'file'
        }]);
        setError("");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to upload file");
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleFileDownload = async (file) => {
    try {
      const response = await fetch('/api/s3/download-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...awsConfig, key: file.key }),
      });
      const result = await response.json();
      if (result.success) {
        window.open(result.url, '_blank');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to generate download URL");
    }
  };

  const handleFileDelete = async (file) => {
    try {
      const response = await fetch('/api/s3/delete-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...awsConfig, key: file.key }),
      });
      const result = await response.json();
      if (result.success) {
        setFiles(prev => prev.filter(f => f.key !== file.key));
        setError("");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to delete file");
    }
  };

  const handleCreateFolder = async (folderName, onSuccess) => {
    try {
      const existingFolder = folders.find(f => f.name === folderName);
      if (existingFolder) {
        throw new Error(`Folder "${folderName}" already exists`);
      }

      const response = await fetch('/api/s3/create-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...awsConfig, prefix: currentPath, folderName }),
      });
      const result = await response.json();
      if (result.success) {
        setFolders(prev => {
          const existingFolder = prev.find(f => f.name === folderName || f.key === result.key);
          if (existingFolder) {
            return prev;
          }
          return [...prev, {
            name: folderName,
            key: result.key,
            type: 'folder'
          }];
        });
        setError("");
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      throw err;
    }
  };

  const handleRenameFolder = async (newName) => {
    const folder = folders.find(f => f.name === newName);
    if (!folder) return;
    
    try {
      const response = await fetch('/api/s3/rename-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...awsConfig, 
          prefix: currentPath, 
          oldName: folder.name, 
          newName 
        }),
      });
      const result = await response.json();
      if (result.success) {
        // Reload contents to reflect changes
        window.location.reload();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to rename folder");
    }
  };

  const handleDeleteFolder = async (folder) => {
    try {
      const response = await fetch('/api/s3/delete-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...awsConfig, prefix: currentPath, folderName: folder.name }),
      });
      const result = await response.json();
      if (result.success) {
        setFolders(prev => prev.filter(f => f.key !== folder.key));
        setError("");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to delete folder");
    }
  };

  // Navigation
  const handleFolderClick = (folder) => {
    setCurrentPath(folder.key);
  };

  const handleBackToRoot = () => {
    setCurrentPath("");
  };

  const handleBack = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop();
    setCurrentPath(pathParts.join('/') + (pathParts.length > 0 ? '/' : ''));
  };

  // Move file operations
  const moveFileToFolder = async (file, destFolderKey) => {
    const newKey = destFolderKey ? destFolderKey + file.name : file.name;
    try {
      const response = await fetch('/api/s3/move-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...awsConfig, oldKey: file.key, newKey }),
      });
      const result = await response.json();
      if (result.success) {
        setFiles(prev => prev.filter(f => f.key !== file.key));
        setError("");
      } else {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (err) {
      setError("Failed to move file");
      throw err;
    }
  };

  const openMoveDialog = async (file) => {
    try {
      const response = await fetch('/api/s3/list-all-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(awsConfig),
      });
      const result = await response.json();
      
      if (result.success) {
        const formattedFolders = result.folders.map(folderKey => {
          const cleanKey = folderKey.replace(/\/$/, '');
          const parts = cleanKey.split('/');
          const folderName = parts[parts.length - 1];
          
          return {
            key: folderKey,
            name: folderName || cleanKey,
            fullPath: cleanKey
          };
        });
        
        setAllFolders(formattedFolders);
      } else {
        setAllFolders([]);
      }
    } catch (error) {
      setAllFolders([]);
    }
  };

  const handleFileDragStart = (e, file) => {
    e.dataTransfer.setData("application/json", JSON.stringify(file));
  };

  const handleFolderDropFile = async (file, folder) => {
    await moveFileToFolder(file, folder.key);
  };

  return {
    // State
    files: getDisplayFiles(), // Use display files (search results or paginated)
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
    
    // Actions
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
    
    // Setters
    setError,
    setCurrentPath,
  };
} 