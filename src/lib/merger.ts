import type { SplitRow } from '../types/diff';

/**
 * Applies one hunk from the source side into the target side and returns the updated texts.
 *
 * "left-to-right" means: make the right panel look like the left panel for this hunk.
 * "right-to-left" means: make the left panel look like the right panel for this hunk.
 */
export function mergeHunk(
  rows: SplitRow[],
  hunkIndex: number,
  direction: 'left-to-right' | 'right-to-left',
  leftText: string,
  rightText: string,
): { newLeftText: string; newRightText: string } {
  const isLTR = direction === 'left-to-right';

  const hunkRows = rows.filter(r => r.hunkIndex === hunkIndex);
  if (hunkRows.length === 0) return { newLeftText: leftText, newRightText: rightText };

  const targetLines = (isLTR ? rightText : leftText).split('\n');

  // Lines that already exist on the target side within this hunk (will be replaced)
  const targetCells = hunkRows
    .map(r => (isLTR ? r.right : r.left))
    .filter((c): c is NonNullable<typeof c> => c !== null);

  // Content coming from the source side
  const sourceContent = hunkRows
    .map(r => (isLTR ? r.left : r.right))
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .map(c => c.content);

  if (targetCells.length === 0) {
    // Nothing on target side yet — find the insertion point after the preceding target line
    const hunkStart = rows.findIndex(r => r.hunkIndex === hunkIndex);
    const prevCell = rows
      .slice(0, hunkStart)
      .reverse()
      .map(r => (isLTR ? r.right : r.left))
      .find((c): c is NonNullable<typeof c> => c !== null);

    const insertAt = prevCell ? prevCell.lineNo : 0;
    targetLines.splice(insertAt, 0, ...sourceContent);
  } else {
    const lineNos = targetCells.map(c => c.lineNo);
    const minLine = Math.min(...lineNos);
    const maxLine = Math.max(...lineNos);
    // Replace the target lines with source content (splice is 0-indexed, lineNo is 1-indexed)
    targetLines.splice(minLine - 1, maxLine - minLine + 1, ...sourceContent);
  }

  const newText = targetLines.join('\n');
  return isLTR
    ? { newLeftText: leftText, newRightText: newText }
    : { newLeftText: newText, newRightText: rightText };
}
