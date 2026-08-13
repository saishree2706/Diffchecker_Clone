import { useState, useCallback } from 'react';
import { computeDiff } from '../lib/differ';
import { mergeHunk } from '../lib/merger';
import type { DiffResult, DiffOptions } from '../types/diff';

const EMPTY_RESULT: DiffResult = {
  rows: [],
  stats: { added: 0, removed: 0, modified: 0, unchanged: 0, totalHunks: 0 },
};

export function useDiff() {
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [options, setOptions] = useState<DiffOptions>({
    ignoreWhitespace: false,
    ignoreCase: false,
  });
  const [diffResult, setDiffResult] = useState<DiffResult>(EMPTY_RESULT);
  const [currentHunk, setCurrentHunk] = useState(-1);
  const [hasDiff, setHasDiff] = useState(false);

  /** Only called explicitly when the user clicks "Find Differences". */
  const findDiff = useCallback(
    (left: string, right: string, opts: DiffOptions) => {
      setDiffResult(computeDiff(left, right, opts));
      setCurrentHunk(-1);
      setHasDiff(true);
    },
    [],
  );

  const swapPanels = useCallback(() => {
    setLeftText(rightText);
    setRightText(leftText);
    // Clear the diff so the result doesn't mismatch the swapped inputs
    setDiffResult(EMPTY_RESULT);
    setHasDiff(false);
  }, [leftText, rightText]);

  const handleMergeHunk = useCallback(
    (hunkIndex: number, direction: 'left-to-right' | 'right-to-left') => {
      const { newLeftText, newRightText } = mergeHunk(
        diffResult.rows,
        hunkIndex,
        direction,
        leftText,
        rightText,
      );
      setLeftText(newLeftText);
      setRightText(newRightText);
      // Immediately recompute so the diff stays in sync after the edit
      const result = computeDiff(newLeftText, newRightText, options);
      setDiffResult(result);
      setCurrentHunk(-1);
    },
    [diffResult.rows, leftText, rightText, options],
  );

  const mergeAll = useCallback(
    (direction: 'left-to-right' | 'right-to-left') => {
      const newLeft = direction === 'right-to-left' ? rightText : leftText;
      const newRight = direction === 'left-to-right' ? leftText : rightText;
      setLeftText(newLeft);
      setRightText(newRight);
      const result = computeDiff(newLeft, newRight, options);
      setDiffResult(result);
      setCurrentHunk(-1);
    },
    [leftText, rightText, options],
  );

  const nextHunk = useCallback(() => {
    const total = diffResult.stats.totalHunks;
    if (total === 0) return;
    setCurrentHunk(h => (h < total - 1 ? h + 1 : 0));
  }, [diffResult.stats.totalHunks]);

  const prevHunk = useCallback(() => {
    const total = diffResult.stats.totalHunks;
    if (total === 0) return;
    setCurrentHunk(h => (h > 0 ? h - 1 : total - 1));
  }, [diffResult.stats.totalHunks]);

  const toggleIgnoreWhitespace = useCallback(() => {
    setOptions(o => ({ ...o, ignoreWhitespace: !o.ignoreWhitespace }));
  }, []);

  const toggleIgnoreCase = useCallback(() => {
    setOptions(o => ({ ...o, ignoreCase: !o.ignoreCase }));
  }, []);

  return {
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
  };
}
