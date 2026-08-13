import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { DiffStats } from './components/DiffStats';
import { SplitView } from './components/SplitView';
import { UnifiedView } from './components/UnifiedView';
import { useDiff } from './hooks/useDiff';
import { useTheme } from './hooks/useTheme';
import { downloadDiff } from './lib/exporter';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [collapseUnchanged, setCollapseUnchanged] = useState(false);
  const diffSectionRef = useRef<HTMLDivElement>(null);

  const {
    leftText,
    setLeftText,
    rightText,
    setRightText,
    options,
    diffResult,
    currentHunk,
    hasDiff,
    findDiff,
    swapPanels,
    handleMergeHunk,
    mergeAll,
    nextHunk,
    prevHunk,
    toggleIgnoreWhitespace,
    toggleIgnoreCase,
  } = useDiff();

  // Keyboard navigation: Alt+Down / Alt+Up
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); nextHunk(); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); prevHunk(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nextHunk, prevHunk]);

  const handleFindDiff = () => {
    findDiff(leftText, rightText, options);
    // Smooth-scroll to the diff section after a paint
    requestAnimationFrame(() => {
      diffSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Header theme={theme} onToggleTheme={toggleTheme} />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-6">

        {/* ── Input panels ───────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-4">

          {/* Left — Original */}
          <div className="flex-1 flex flex-col border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden focus-within:border-indigo-400 dark:focus-within:border-indigo-500 transition-colors shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-300 dark:border-gray-600">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                Original Text
              </span>
              <button
                onClick={() => setLeftText('')}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                Clear
              </button>
            </div>
            <textarea
              value={leftText}
              onChange={e => setLeftText(e.target.value)}
              placeholder="Paste your original text here…"
              spellCheck={false}
              className="flex-1 w-full p-3 font-mono text-sm resize-none bg-white dark:bg-gray-900 focus:outline-none placeholder:text-gray-300 dark:placeholder:text-gray-700 min-h-[220px]"
            />
          </div>

          {/* Right — Changed */}
          <div className="flex-1 flex flex-col border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden focus-within:border-indigo-400 dark:focus-within:border-indigo-500 transition-colors shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-300 dark:border-gray-600">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                Changed Text
              </span>
              <button
                onClick={() => setRightText('')}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                Clear
              </button>
            </div>
            <textarea
              value={rightText}
              onChange={e => setRightText(e.target.value)}
              placeholder="Paste your changed text here…"
              spellCheck={false}
              className="flex-1 w-full p-3 font-mono text-sm resize-none bg-white dark:bg-gray-900 focus:outline-none placeholder:text-gray-300 dark:placeholder:text-gray-700 min-h-[220px]"
            />
          </div>
        </div>

        {/* ── Find Differences button ─────────────────────────────────── */}
        <div className="flex items-center justify-center gap-3 mt-5">
          <button
            onClick={handleFindDiff}
            className="px-10 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-sm transition-colors"
          >
            Find Differences
          </button>
          <button
            onClick={swapPanels}
            title="Swap Original ↔ Changed"
            className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium transition-colors shadow-sm"
          >
            ⇄ Swap
          </button>
        </div>

        {/* ── Diff output (only after Find Differences is clicked) ────── */}
        {hasDiff && (
          <div
            ref={diffSectionRef}
            className="mt-8 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm"
          >
            {/* Toolbar */}
            <Toolbar
              onSwap={swapPanels}
              onPrev={prevHunk}
              onNext={nextHunk}
              onMergeAll={mergeAll}
              onDownload={() => downloadDiff(diffResult.rows, diffResult.stats)}
              ignoreWhitespace={options.ignoreWhitespace}
              ignoreCase={options.ignoreCase}
              onToggleWhitespace={toggleIgnoreWhitespace}
              onToggleCase={toggleIgnoreCase}
              collapseUnchanged={collapseUnchanged}
              onToggleCollapse={() => setCollapseUnchanged(v => !v)}
              viewMode={viewMode}
              onToggleView={() => setViewMode(v => (v === 'split' ? 'unified' : 'split'))}
              currentHunk={currentHunk}
              totalHunks={diffResult.stats.totalHunks}
              rows={diffResult.rows}
            />

            {/* Stats bar */}
            <DiffStats stats={diffResult.stats} />

            {/* Diff table */}
            <div className="bg-white dark:bg-gray-900">
              {viewMode === 'split' ? (
                <SplitView
                  rows={diffResult.rows}
                  currentHunk={currentHunk}
                  onMerge={handleMergeHunk}
                  collapseUnchanged={collapseUnchanged}
                />
              ) : (
                <UnifiedView
                  rows={diffResult.rows}
                  currentHunk={currentHunk}
                  collapseUnchanged={collapseUnchanged}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
