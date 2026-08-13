import { APP_CONFIG } from '../config';
import type { SplitRow, DiffStats } from '../types/diff';

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\t/g, '    ');
}

function renderCellHtml(
  content: string,
  parts: { value: string; highlight: boolean }[] | undefined,
  highlightColor: string,
): string {
  if (!parts) return esc(content);
  return parts
    .map(p =>
      p.highlight
        ? `<mark style="background:${highlightColor};border-radius:2px;padding:0 1px">${esc(p.value)}</mark>`
        : esc(p.value),
    )
    .join('');
}

function generateHtml(rows: SplitRow[], stats: DiffStats): string {
  const tableRows = rows
    .map(row => {
      const leftBg =
        row.type === 'removed' || row.type === 'modified'
          ? '#fff0f0'
          : row.type === 'unchanged'
            ? '#ffffff'
            : '#f8f8f8';
      const rightBg =
        row.type === 'added' || row.type === 'modified'
          ? '#f0fff4'
          : row.type === 'unchanged'
            ? '#ffffff'
            : '#f8f8f8';

      const leftHtml = row.left
        ? renderCellHtml(row.left.content, row.left.parts, '#ffc0c0')
        : '';
      const rightHtml = row.right
        ? renderCellHtml(row.right.content, row.right.parts, '#a0f0a0')
        : '';

      return `<tr>
  <td class="ln">${row.left?.lineNo ?? ''}</td>
  <td class="code" style="background:${leftBg}">${leftHtml}</td>
  <td class="ln sep">${row.right?.lineNo ?? ''}</td>
  <td class="code" style="background:${rightBg}">${rightHtml}</td>
</tr>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Diff — ${APP_CONFIG.APP_NAME}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font:13px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;padding:20px;color:#1a1a1a}
.header{background:#fff;border:1px solid #ddd;border-radius:8px;padding:16px 20px;margin-bottom:16px}
h1{font-size:15px;font-weight:600;margin-bottom:10px;color:#333}
.stats{display:flex;gap:20px;font-size:13px;font-weight:500}
.a{color:#1a7f37}.r{color:#cf222e}.m{color:#9a6700}.u{color:#6e7781}
table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #ddd;border-radius:8px;overflow:hidden;font-family:'SF Mono','Fira Code',Consolas,monospace;font-size:12px}
.ln{width:50px;padding:2px 8px;text-align:right;color:#999;background:#fafafa;border-right:1px solid #eee;user-select:none;white-space:nowrap;vertical-align:top}
.sep{border-left:2px solid #e0e0e0}
.code{padding:2px 12px;white-space:pre;vertical-align:top}
mark{border-radius:2px}
</style>
</head>
<body>
<div class="header">
  <h1>Diff Report &middot; ${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION}</h1>
  <div class="stats">
    <span class="a">+${stats.added} added</span>
    <span class="r">-${stats.removed} removed</span>
    <span class="m">~${stats.modified} modified</span>
    <span class="u">${stats.unchanged} unchanged</span>
  </div>
</div>
<table><tbody>
${tableRows}
</tbody></table>
</body>
</html>`;
}

function generateUnifiedDiff(rows: SplitRow[]): string {
  const lines = ['--- Left', '+++ Right'];
  for (const row of rows) {
    switch (row.type) {
      case 'unchanged':
        lines.push(` ${row.left!.content}`);
        break;
      case 'removed':
        lines.push(`-${row.left!.content}`);
        break;
      case 'added':
        lines.push(`+${row.right!.content}`);
        break;
      case 'modified':
        lines.push(`-${row.left!.content}`);
        lines.push(`+${row.right!.content}`);
        break;
    }
  }
  return lines.join('\n');
}

export function downloadDiff(rows: SplitRow[], stats: DiffStats): void {
  const fmt = APP_CONFIG.DOWNLOAD_FORMAT;
  const content = fmt === 'html' ? generateHtml(rows, stats) : generateUnifiedDiff(rows);
  const ext = fmt === 'html' ? 'html' : 'diff';
  const mime = fmt === 'html' ? 'text/html' : 'text/plain';
  const date = new Date().toISOString().slice(0, 10);

  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `diff-${date}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function buildClipboardText(rows: SplitRow[]): string {
  return rows
    .filter(r => r.type !== 'unchanged')
    .flatMap(r => {
      if (r.type === 'removed') return [`- ${r.left!.content}`];
      if (r.type === 'added') return [`+ ${r.right!.content}`];
      // modified
      return [`- ${r.left!.content}`, `+ ${r.right!.content}`];
    })
    .join('\n');
}
