import { useState } from 'react';
import {
  ArrowLeftRight,
  ChevronUp,
  ChevronDown,
  Download,
  Clipboard,
  ClipboardCheck,
  ChevronsUpDown,
  Columns2,
  AlignJustify,
} from 'lucide-react';
import { buildClipboardText } from '../lib/exporter';
import { APP_CONFIG } from '../config';
import type { SplitRow } from '../types/diff';

interface ToolbarProps {
  onSwap: () => void;
  onPrev: () => void;
  onNext: () => void;
  onMergeAll: (direction: 'left-to-right' | 'right-to-left') => void;
  onDownload: () => void;
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
  onToggleWhitespace: () => void;
  onToggleCase: () => void;
  collapseUnchanged: boolean;
  onToggleCollapse: () => void;
  viewMode: 'split' | 'unified';
  onToggleView: () => void;
  currentHunk: number;
  totalHunks: number;
  rows: SplitRow[];
}

function Divider() {
  return <span className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-0.5" />;
}

function ToggleBtn({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
        active
          ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {children}
    </button>
  );
}

function IconBtn({
  onClick,
  title,
  disabled,
  children,
}: {
  onClick: () => void;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

export function Toolbar({
  onSwap,
  onPrev,
  onNext,
  onMergeAll,
  onDownload,
  ignoreWhitespace,
  ignoreCase,
  onToggleWhitespace,
  onToggleCase,
  collapseUnchanged,
  onToggleCollapse,
  viewMode,
  onToggleView,
  currentHunk,
  totalHunks,
  rows,
}: ToolbarProps) {
  const [copied, setCopied] = useState(false);
  const noDiff = totalHunks === 0;

  const handleCopy = async () => {
    const text = buildClipboardText(rows);
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hunkLabel =
    totalHunks === 0 ? '—' : `${currentHunk === -1 ? 1 : currentHunk + 1}/${totalHunks}`;

  return (
    <div className="flex flex-wrap items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0">
      {/* Swap */}
      <IconBtn onClick={onSwap} title="Swap panels">
        <ArrowLeftRight className="w-3.5 h-3.5" />
      </IconBtn>

      <Divider />

      {/* Diff options */}
      <ToggleBtn active={ignoreWhitespace} onClick={onToggleWhitespace} title="Ignore whitespace">
        Whitespace
      </ToggleBtn>
      <ToggleBtn active={ignoreCase} onClick={onToggleCase} title="Ignore case">
        Case
      </ToggleBtn>
      <ToggleBtn active={collapseUnchanged} onClick={onToggleCollapse} title="Collapse unchanged lines">
        <ChevronsUpDown className="w-3 h-3" />
        Collapse
      </ToggleBtn>

      <Divider />

      {/* View mode */}
      <IconBtn
        onClick={onToggleView}
        title={viewMode === 'split' ? 'Switch to unified view' : 'Switch to split view'}
      >
        {viewMode === 'split' ? (
          <AlignJustify className="w-3.5 h-3.5" />
        ) : (
          <Columns2 className="w-3.5 h-3.5" />
        )}
      </IconBtn>

      <Divider />

      {/* Hunk navigation */}
      <div className="flex items-center gap-0.5">
        <IconBtn onClick={onPrev} title="Previous hunk (Alt+↑)" disabled={noDiff}>
          <ChevronUp className="w-3.5 h-3.5" />
        </IconBtn>
        <span className="text-xs text-gray-400 dark:text-gray-500 w-10 text-center tabular-nums">
          {hunkLabel}
        </span>
        <IconBtn onClick={onNext} title="Next hunk (Alt+↓)" disabled={noDiff}>
          <ChevronDown className="w-3.5 h-3.5" />
        </IconBtn>
      </div>

      <Divider />

      {/* Merge all */}
      <button
        onClick={() => onMergeAll('right-to-left')}
        disabled={noDiff}
        title="Apply all hunks to left panel"
        className="px-2 py-1.5 rounded text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ← All
      </button>
      <button
        onClick={() => onMergeAll('left-to-right')}
        disabled={noDiff}
        title="Apply all hunks to right panel"
        className="px-2 py-1.5 rounded text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        → All
      </button>

      {/* Push remaining controls to the right */}
      <span className="flex-1" />

      {/* Copy diff */}
      <button
        onClick={handleCopy}
        disabled={noDiff}
        title="Copy changed lines to clipboard"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {copied ? (
          <ClipboardCheck className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
        ) : (
          <Clipboard className="w-3.5 h-3.5" />
        )}
        {copied ? 'Copied!' : 'Copy diff'}
      </button>

      {/* Download */}
      <button
        onClick={onDownload}
        disabled={noDiff}
        title={`Download diff as ${APP_CONFIG.DOWNLOAD_FORMAT.toUpperCase()}`}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Download className="w-3.5 h-3.5" />
        Download
      </button>
    </div>
  );
}
