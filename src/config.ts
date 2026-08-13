/**
 * Application Configuration
 * All tuneable knobs live here. Change a value and rebuild — no hunting through components.
 */
export const APP_CONFIG = {
  /**
   * Download format for the exported diff file.
   *   'html' — Self-contained HTML with all colours preserved. Opens in any browser. (default)
   *   'diff' — Standard unified diff / patch format. Git-compatible, works with `patch`.
   */
  DOWNLOAD_FORMAT: 'html' as 'html' | 'diff',

  /**
   * Milliseconds of idle time after the user stops typing before the diff is recomputed.
   * Lower = snappier feedback. Higher = cheaper on very large texts.
   */
  DIFF_DEBOUNCE_MS: 300,

  /**
   * When "Collapse Unchanged" mode is on, this many lines of context are kept visible
   * above and below each changed hunk (matching GitHub / git-diff style).
   */
  CONTEXT_LINES: 3,

  /**
   * When true, inline diff highlights exact characters that changed within a word.
   * When false, only whole words are highlighted.
   */
  CHAR_LEVEL_DIFF: true,

  /**
   * Initial colour theme.
   *   'system' — respects the OS dark/light preference (recommended)
   *   'light'  — always light
   *   'dark'   — always dark
   */
  DEFAULT_THEME: 'system' as 'system' | 'light' | 'dark',

  APP_NAME: 'DiffChecker',
  APP_VERSION: '1.0.0',
} as const;
