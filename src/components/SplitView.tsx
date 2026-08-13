import { useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { APP_CONFIG } from '../config';
import type { SplitRow, InlinePart } from '../types/diff';

interface SplitViewProps {
  rows: SplitRow[];
  currentHunk: number;
  onMerge: (hunkIndex: number, direction: 'left-to-right' | 'right-to-left') => void;
  collapseUnchanged: boolean;
}

type DisplayItem =
  | { kind: 'row'; row: SplitRow; isFirstOfHunk: boolean }
  | { kind: 'expander'; count: number; key: string };

function buildItems(
  rows: SplitRow[],
  collapse: boolean,
  ctx: number,
): DisplayItem[] {
  const items: DisplayItem[] = [];
  let prevHunk = -2;

  if (!collapse) {
    for (const row of rows) {
      const isFirst = row.hunkIndex >= 0 && row.hunkIndex !== prevHunk;
      if (isFirst) prevHunk = row.hunkIndex;
      items.push({ kind: 'row', row, isFirstOfHunk: isFirst });
    }
    return items;
  }

  let i = 0;
  while (i < rows.length) {
    const row = rows[i];
    if (row.type !== 'unchanged') {
      const isFirst = row.hunkIndex >= 0 && row.hunkIndex !== prevHunk;
      if (isFirst) prevHunk = row.hunkIndex;
      items.push({ kind: 'row', row, isFirstOfHunk: isFirst });
      i++;
      continue;
    }

    let j = i;
    while (j < rows.length && rows[j].type === 'unchanged') j++;
    const run = j - i;

    if (run <= ctx * 2) {
      for (let k = i; k < j; k++) {
        items.push({ kind: 'row', row: rows[k], isFirstOfHunk: false });
      }
    } else {
      for (let k = i; k < i + ctx; k++) {
        items.push({ kind: 'row', row: rows[k], isFirstOfHunk: false });
      }
      items.push({ kind: 'expander', count: run - ctx * 2, key: `exp-${i}` });
      for (let k = j - ctx; k < j; k++) {
        items.push({ kind: 'row', row: rows[k], isFirstOfHunk: false });
      }
    }
    i = j;
  }
  return items;
}

function Parts({ parts, side }: { parts: InlinePart[]; side: 'left' | 'right' }) {
  return (
    <>
      {parts.map((p, idx) =>
        p.highlight ? (
          <mark
            key={idx}
            className={
              side === 'left'
                ? 'bg-red-200 dark:bg-red-800/70 rounded-[2px]'
                : 'bg-green-200 dark:bg-green-800/70 rounded-[2px]'
            }
          >
            {p.value}
          </mark>
        ) : (
          <span key={idx}>{p.value}</span>
        ),
      )}
    </>
  );
}

const rowBg = {
  left: {
    removed: 'bg-red-50 dark:bg-red-950/50',
    added: 'bg-gray-50/60 dark:bg-gray-800/20',
    modified: 'bg-red-50 dark:bg-red-950/50',
    unchanged: '',
    placeholder: '',
  },
  right: {
    removed: 'bg-gray-50/60 dark:bg-gray-800/20',
    added: 'bg-green-50 dark:bg-green-950/50',
    modified: 'bg-green-50 dark:bg-green-950/50',
    unchanged: '',
    placeholder: '',
  },
} as const;

export function SplitView({ rows, currentHunk, onMerge, collapseUnchanged }: SplitViewProps) {
  const firstOfHunkRefs = useRef<Map<number, HTMLTableRowElement>>(new Map());

  const items = useMemo(
    () => buildItems(rows, collapseUnchanged, APP_CONFIG.CONTEXT_LINES),
    [rows, collapseUnchanged],
  );

  useEffect(() => {
    if (currentHunk < 0) return;
    firstOfHunkRefs.current.get(currentHunk)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [currentHunk]);

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400 dark:text-gray-600">
        Paste text in both panels above to see the diff
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="w-full table-fixed border-collapse font-mono text-xs leading-5">
        <colgroup>
          <col style={{ width: '3rem' }} />
          <col />
          <col style={{ width: '4rem' }} />
          <col style={{ width: '3rem' }} />
          <col />
        </colgroup>
        <tbody>
          {items.map(item => {
            if (item.kind === 'expander') {
              return (
                <tr key={item.key} className="bg-sky-50 dark:bg-sky-950/30">
                  <td
                    colSpan={5}
                    className="py-0.5 text-center text-xs text-sky-500 dark:text-sky-400 select-none"
                  >
                    ↕&nbsp;{item.count} unchanged line{item.count !== 1 ? 's' : ''} hidden
                  </td>
                </tr>
              );
            }

            const { row, isFirstOfHunk } = item;
            const isCurrent = row.hunkIndex === currentHunk && currentHunk >= 0;
            const lBg = rowBg.left[row.type];
            const rBg = rowBg.right[row.type];

            return (
              <tr
                key={row.id}
                ref={el => {
                  if (isFirstOfHunk && el) firstOfHunkRefs.current.set(row.hunkIndex, el);
                }}
                className={clsx(isCurrent && 'ring-inset ring-1 ring-indigo-400 dark:ring-indigo-500')}
              >
                {/* Left line number */}
                <td
                  className={clsx(
                    'text-right pr-2 pl-1 py-px select-none text-gray-400 dark:text-gray-600 border-r border-gray-200 dark:border-gray-700',
                    lBg,
                  )}
                >
                  {row.left?.lineNo}
                </td>

                {/* Left content */}
                <td className={clsx('px-3 py-px whitespace-pre-wrap break-words', lBg)}>
                  {row.left ? (
                    row.left.parts ? (
                      <Parts parts={row.left.parts} side="left" />
                    ) : (
                      row.left.content
                    )
                  ) : null}
                </td>

                {/* Merge controls */}
                <td className="px-1 py-px text-center border-x border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                  {isFirstOfHunk && (
                    <span className="inline-flex items-center gap-0.5">
                      <button
                        onClick={() => onMerge(row.hunkIndex, 'right-to-left')}
                        title="Apply hunk to left"
                        className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onMerge(row.hunkIndex, 'left-to-right')}
                        title="Apply hunk to right"
                        className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </td>

                {/* Right line number */}
                <td
                  className={clsx(
                    'text-right pr-2 pl-1 py-px select-none text-gray-400 dark:text-gray-600 border-r border-gray-200 dark:border-gray-700',
                    rBg,
                  )}
                >
                  {row.right?.lineNo}
                </td>

                {/* Right content */}
                <td className={clsx('px-3 py-px whitespace-pre-wrap break-words', rBg)}>
                  {row.right ? (
                    row.right.parts ? (
                      <Parts parts={row.right.parts} side="right" />
                    ) : (
                      row.right.content
                    )
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
