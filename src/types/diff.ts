export interface InlinePart {
  value: string;
  highlight: boolean;
}

export interface SplitCell {
  lineNo: number;
  content: string;
  parts?: InlinePart[];
}

export type RowType = 'unchanged' | 'removed' | 'added' | 'modified' | 'placeholder';

export interface SplitRow {
  id: string;
  left: SplitCell | null;
  right: SplitCell | null;
  type: RowType;
  /** -1 for unchanged rows, ≥0 for changed hunks */
  hunkIndex: number;
}

export interface DiffStats {
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
  totalHunks: number;
}

export interface DiffResult {
  rows: SplitRow[];
  stats: DiffStats;
}

export interface DiffOptions {
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
}
