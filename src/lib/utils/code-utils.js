/**
 * Add indentation (tab) or remove (shift-tab) for a textarea value
 */
export function handleTab(text, selectionStart, selectionEnd, shiftKey = false) {
  const lines = text.substring(0, selectionEnd).split('\n');
  const startLineIdx = text.substring(0, selectionStart).split('\n').length - 1;

  if (!shiftKey) {
    // Add two spaces to the selected lines
    const before = lines.slice(0, startLineIdx).join('\n');
    const selected = lines.slice(startLineIdx).join('\n');
    const newText = before + (before ? '\n' : '') + selected.replace(/^/gm, '  ');
    const newCursor = selectionEnd + 2;
    return { text: newText, cursor: newCursor };
  } else {
    // Remove two spaces if present at the start of lines
    const before = lines.slice(0, startLineIdx).join('\n');
    const selectedLines = lines.slice(startLineIdx).map(line =>
      line.startsWith('  ') ? line.slice(2) : line
    );
    const newText = before + (before ? '\n' : '') + selectedLines.join('\n');
    const newCursor = Math.max(0, selectionEnd - 2);
    return { text: newText, cursor: newCursor };
  }
}

/**
 * Generate line numbers for a given text
 */
export function generateLineNumbers(text) {
  return text.split('\n').map((_, i) => i + 1);
}

/**
 * Simple JSON syntax highlighting (returns HTML string)
 */
export function highlightJson(json) {
  if (!json) return '';
  let formatted = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  formatted = formatted.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|\b\d+\b)/g,
    match => {
      let cls = 'number';
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'key' : 'string';
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
  return formatted;
}
