"use client";

export default function FolderRow({ folder, onClick, isLast }) {
  return (
    <div
      className={`flex items-center gap-4 p-4 bg-card dark:bg-card hover:bg-muted dark:hover:bg-secondary/60 cursor-pointer transition-all duration-150 ${
        !isLast ? 'border-b border-border dark:border-border' : ''
      }`}
      onClick={() => onClick(folder)}
    >
      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground dark:text-white">{folder.name}</p>
        <p className="text-sm text-muted-foreground dark:text-gray-400">Folder</p>
      </div>
      <svg className="w-5 h-5 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
} 