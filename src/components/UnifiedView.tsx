import { useMemo } from 'react';
import { clsx } from 'clsx';
import { APP_CONFIG } from '../config';
import type { SplitRow, InlinePart } from '../types/diff';

interface UnifiedViewProps {
  rows: SplitRow[];
  currentHunk: number;
  collapseUnchanged: boolean;
}

/** A sentinel hunkIndex value used to mark collapsed-section placeholder rows. */
const EXPANDER_HUNK = -2;

function collapseRows(rows: SplitRow[], ctx: number): SplitRow[] {
  const out: SplitRow[] = [];
  let i = 0;
  while (i < rows.length) {
    if (rows[i].type !== 'unchanged') { out.push(rows[i++]); continue; }
    let j = i;
    while (j < rows.length && rows[j].type === 'unchanged') j++;
    const run = j - i;
    if (run <= ctx * 2) {
      for (let k = i; k < j; k++) out.push(rows[k]);
    } else {
      for (let k = i; k < i + ctx; k++) out.push(rows[k]);
      // Synthetic placeholder row — borrows shape of SplitRow, hunkIndex = EXPANDER_HUNK
      out.push({
        id: `exp-${i}`,
        left: { lineNo: run - ctx * 2, content: '' },
        right: null,
        type: 'placeholder',
        hunkIndex: EXPANDER_HUNK,
      });
      for (let k = j - ctx; k < j; k++) out.push(rows[k]);
    }
    i = j;
  }
  return out;
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

const LN_BASE = 'text-right pr-2 pl-1 py-px select-none text-gray-400 dark:text-gray-600 border-r border-gray-200 dark:border-gray-700 w-12';
const CODE_BASE = 'px-3 py-px whitespace-pre-wrap break-words';

export function UnifiedView({ rows, currentHunk, collapseUnchanged }: UnifiedViewProps) {
  const display = useMemo(
    () => (collapseUnchanged ? collapseRows(rows, APP_CONFIG.CONTEXT_LINES) : rows),
    [rows, collapseUnchanged],
  );

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400 dark:text-gray-600">
        Paste text in both panels above to see the diff
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse font-mono text-xs leading-5">
        <colgroup>
          <col style={{ width: '3rem' }} />
          <col style={{ width: '3rem' }} />
          <col style={{ width: '1.25rem' }} />
          <col />
        </colgroup>
        <tbody>
          {display.flatMap(row => {
            // Collapsed section indicator
            if (row.hunkIndex === EXPANDER_HUNK) {
              return [
                <tr key={row.id} className="bg-sky-50 dark:bg-sky-950/30">
                  <td
                    colSpan={4}
                    className="py-0.5 text-center text-xs text-sky-500 dark:text-sky-400 select-none"
                  >
                    ↕&nbsp;{row.left!.lineNo} unchanged line{row.left!.lineNo !== 1 ? 's' : ''} hidden
                  </td>
                </tr>,
              ];
            }

            const isCurrent = row.hunkIndex === currentHunk && currentHunk >= 0;
            const ringCls = isCurrent ? 'ring-inset ring-1 ring-indigo-400 dark:ring-indigo-500' : '';

            if (row.type === 'modified') {
              return [
                // Removed line
                <tr key={`${row.id}-l`} className={clsx('bg-red-50 dark:bg-red-950/50', ringCls)}>
                  <td className={clsx(LN_BASE, 'bg-red-50 dark:bg-red-950/50')}>{row.left?.lineNo}</td>
                  <td className={clsx(LN_BASE, 'bg-red-50 dark:bg-red-950/50')} />
                  <td className="px-1 py-px font-bold text-red-500 dark:text-red-400 select-none">-</td>
                  <td className={clsx(CODE_BASE, 'bg-red-50 dark:bg-red-950/50')}>
                    {row.left?.parts ? <Parts parts={row.left.parts} side="left" /> : row.left?.content}
                  </td>
                </tr>,
                // Added line
                <tr key={`${row.id}-r`} className={clsx('bg-green-50 dark:bg-green-950/50', ringCls)}>
                  <td className={clsx(LN_BASE, 'bg-green-50 dark:bg-green-950/50')} />
                  <td className={clsx(LN_BASE, 'bg-green-50 dark:bg-green-950/50')}>{row.right?.lineNo}</td>
                  <td className="px-1 py-px font-bold text-green-600 dark:text-green-400 select-none">+</td>
                  <td className={clsx(CODE_BASE, 'bg-green-50 dark:bg-green-950/50')}>
                    {row.right?.parts ? <Parts parts={row.right.parts} side="right" /> : row.right?.content}
                  </td>
                </tr>,
              ];
            }

            const bg =
              row.type === 'removed'
                ? 'bg-red-50 dark:bg-red-950/50'
                : row.type === 'added'
                  ? 'bg-green-50 dark:bg-green-950/50'
                  : '';
            const prefix =
              row.type === 'removed' ? '-' : row.type === 'added' ? '+' : ' ';
            const prefixColor =
              row.type === 'removed'
                ? 'text-red-500 dark:text-red-400'
                : row.type === 'added'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-300 dark:text-gray-700';
            const leftNo = row.type !== 'added' ? row.left?.lineNo : undefined;
            const rightNo = row.type === 'added' ? row.right?.lineNo : undefined;
            const content = row.type === 'added' ? row.right?.content : row.left?.content;

            return [
              <tr key={row.id} className={clsx(bg, ringCls)}>
                <td className={clsx(LN_BASE, bg)}>{leftNo}</td>
                <td className={clsx(LN_BASE, bg)}>{rightNo}</td>
                <td className={clsx('px-1 py-px font-bold select-none', prefixColor)}>{prefix}</td>
                <td className={clsx(CODE_BASE, bg)}>{content}</td>
              </tr>,
            ];
          })}
        </tbody>
      </table>
    </div>
  );
}
