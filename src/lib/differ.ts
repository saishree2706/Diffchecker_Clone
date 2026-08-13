import * as Diff from 'diff';
import { APP_CONFIG } from '../config';
import type { DiffResult, DiffOptions, SplitRow, InlinePart } from '../types/diff';

function computeInlineParts(
  left: string,
  right: string,
): { leftParts: InlinePart[]; rightParts: InlinePart[] } {
  const changes = APP_CONFIG.CHAR_LEVEL_DIFF
    ? Diff.diffChars(left, right)
    : Diff.diffWords(left, right);

  const leftParts: InlinePart[] = [];
  const rightParts: InlinePart[] = [];

  for (const change of changes) {
    if (change.removed) {
      leftParts.push({ value: change.value, highlight: true });
    } else if (change.added) {
      rightParts.push({ value: change.value, highlight: true });
    } else {
      leftParts.push({ value: change.value, highlight: false });
      rightParts.push({ value: change.value, highlight: false });
    }
  }

  return { leftParts, rightParts };
}

/**
 * Splits text into lines, stripping the trailing empty string produced by a trailing newline.
 */
function splitLines(text: string): string[] {
  const lines = text.split('\n');
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  return lines;
}

const EMPTY_STATS = { added: 0, removed: 0, modified: 0, unchanged: 0, totalHunks: 0 };

export function computeDiff(
  leftText: string,
  rightText: string,
  options: DiffOptions,
): DiffResult {
  if (!leftText && !rightText) {
    return { rows: [], stats: { ...EMPTY_STATS } };
  }

  // Normalise for comparison only; original text is preserved via line index mapping.
  const leftForDiff = options.ignoreCase ? leftText.toLowerCase() : leftText;
  const rightForDiff = options.ignoreCase ? rightText.toLowerCase() : rightText;

  const changes = Diff.diffLines(leftForDiff, rightForDiff, {
    ignoreWhitespace: options.ignoreWhitespace,
  });

  // Original lines (used for display regardless of normalisation flags)
  const origLeft = splitLines(leftText);
  const origRight = splitLines(rightText);

  const rows: SplitRow[] = [];
  let leftIdx = 0;
  let rightIdx = 0;
  let leftLineNo = 1;
  let rightLineNo = 1;
  let hunkIndex = 0;
  let rowId = 0;
  const stats = { ...EMPTY_STATS };

  const nextId = () => `r${rowId++}`;

  let i = 0;
  while (i < changes.length) {
    const change = changes[i];
    const count = change.count ?? splitLines(change.value).length;

    if (!change.added && !change.removed) {
      for (let k = 0; k < count; k++) {
        const line = origLeft[leftIdx + k] ?? '';
        rows.push({
          id: nextId(),
          left: { lineNo: leftLineNo++, content: line },
          right: { lineNo: rightLineNo++, content: line },
          type: 'unchanged',
          hunkIndex: -1,
        });
        stats.unchanged++;
      }
      leftIdx += count;
      rightIdx += count;
      i++;
      continue;
    }

    if (change.removed) {
      const removedCount = count;
      const nextChange = changes[i + 1];

      if (nextChange?.added) {
        const addedCount = nextChange.count ?? splitLines(nextChange.value).length;
        const maxLen = Math.max(removedCount, addedCount);

        for (let j = 0; j < maxLen; j++) {
          const hasLeft = j < removedCount;
          const hasRight = j < addedCount;
          const leftLine = hasLeft ? (origLeft[leftIdx + j] ?? '') : null;
          const rightLine = hasRight ? (origRight[rightIdx + j] ?? '') : null;

          if (leftLine !== null && rightLine !== null) {
            const { leftParts, rightParts } = computeInlineParts(leftLine, rightLine);
            rows.push({
              id: nextId(),
              left: { lineNo: leftLineNo++, content: leftLine, parts: leftParts },
              right: { lineNo: rightLineNo++, content: rightLine, parts: rightParts },
              type: 'modified',
              hunkIndex,
            });
            stats.modified++;
          } else if (leftLine !== null) {
            rows.push({
              id: nextId(),
              left: { lineNo: leftLineNo++, content: leftLine },
              right: null,
              type: 'removed',
              hunkIndex,
            });
            stats.removed++;
          } else {
            rows.push({
              id: nextId(),
              left: null,
              right: { lineNo: rightLineNo++, content: rightLine! },
              type: 'added',
              hunkIndex,
            });
            stats.added++;
          }
        }

        leftIdx += removedCount;
        rightIdx += addedCount;
        hunkIndex++;
        stats.totalHunks++;
        i += 2;
        continue;
      }

      // Pure removal
      for (let k = 0; k < removedCount; k++) {
        rows.push({
          id: nextId(),
          left: { lineNo: leftLineNo++, content: origLeft[leftIdx + k] ?? '' },
          right: null,
          type: 'removed',
          hunkIndex,
        });
        stats.removed++;
      }
      leftIdx += removedCount;
      hunkIndex++;
      stats.totalHunks++;
      i++;
      continue;
    }

    if (change.added) {
      for (let k = 0; k < count; k++) {
        rows.push({
          id: nextId(),
          left: null,
          right: { lineNo: rightLineNo++, content: origRight[rightIdx + k] ?? '' },
          type: 'added',
          hunkIndex,
        });
        stats.added++;
      }
      rightIdx += count;
      hunkIndex++;
      stats.totalHunks++;
      i++;
      continue;
    }

    i++;
  }

  return { rows, stats };
}
