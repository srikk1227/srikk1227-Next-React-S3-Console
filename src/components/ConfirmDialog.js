"use client";

export default function ConfirmDialog({ open, title, description, confirmText = "Delete", cancelText = "Cancel", onConfirm, onCancel, fileName }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/60">
      <div className="bg-card dark:bg-card rounded-xl shadow-xl max-w-sm w-full p-6 relative animate-fade-in border border-border dark:border-border">
        <h2 className="text-lg font-semibold text-foreground dark:text-white mb-2">{title}</h2>
        <p className="text-foreground dark:text-gray-300 mb-6 text-sm break-words" style={{ wordBreak: 'break-all' }}>
          {description}
          {fileName && (
            <span
              className="block mt-2 font-mono text-xs text-muted-foreground dark:text-gray-400 truncate max-w-full"
              title={fileName}
              style={{ wordBreak: 'break-all' }}
            >
              {fileName}
            </span>
          )}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-muted dark:bg-secondary text-foreground dark:text-gray-200 hover:bg-muted/80 dark:hover:bg-secondary/70 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 dark:bg-red-500 text-white dark:text-white hover:bg-red-700 dark:hover:bg-red-600 transition-colors font-semibold"
          >
            {confirmText}
          </button>
        </div>
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <style jsx>{`
        .animate-fade-in { animation: fadeIn 0.15s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
} 