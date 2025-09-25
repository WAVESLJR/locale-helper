<script>
  import { prettifyJson, isValidLocaleJson, fixJsonIssues } from '$lib/utils/json-utils.js';

  export let value = '';
  export let onChange = null;
  export let readOnly = false;
  export let maxHeight = '300px';
  export let rows = 10; 
  export let mode = 'json';

  let textarea;
  let copied = false;
  
  // Simple input handler
  const handleInput = (e) => {
    const newValue = e.target.value;
    value = newValue;
    if (onChange) onChange(newValue);
  };

  // Manual format function
  const formatJson = () => {
    if (mode !== 'json' || !value.trim()) return;
    
    try {
      let parsed = JSON.parse(value);
      if (isValidLocaleJson(parsed)) {
        const formatted = prettifyJson(parsed, 2);
        value = formatted;
        if (onChange) onChange(formatted);
      }
    } catch (_) {
      try {
        const fixed = fixJsonIssues(value);
        const parsed = JSON.parse(fixed);
        if (isValidLocaleJson(parsed)) {
          const formatted = prettifyJson(parsed, 2);
          value = formatted;
          if (onChange) onChange(formatted);
        }
      } catch (_) {
        // Invalid JSON, leave as-is
      }
    }
  };

  // Reset function
  const resetContent = () => {
    value = '';
    if (onChange) onChange('');
    if (textarea) textarea.focus();
  };

  // Copy function
  const copyContent = async () => {
    if (!value.trim()) return;
    
    try {
      await navigator.clipboard.writeText(value);
      copied = true;
      setTimeout(() => copied = false, 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Tab handling
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      
      if (e.shiftKey) {
        // Remove indent
        const lines = value.split('\n');
        const startLine = value.substring(0, start).split('\n').length - 1;
        const endLine = value.substring(0, end).split('\n').length - 1;
        
        for (let i = startLine; i <= endLine; i++) {
          if (lines[i].startsWith('  ')) {
            lines[i] = lines[i].substring(2);
          }
        }
        
        const newValue = lines.join('\n');
        value = newValue;
        if (onChange) onChange(newValue);
        
        setTimeout(() => {
          e.target.selectionStart = Math.max(0, start - 2);
          e.target.selectionEnd = Math.max(0, end - 2);
        }, 0);
      } else {
        // Add indent
        const newValue = value.substring(0, start) + '  ' + value.substring(end);
        value = newValue;
        if (onChange) onChange(newValue);
        
        setTimeout(() => {
          e.target.selectionStart = e.target.selectionEnd = start + 2;
        }, 0);
      }
    }
  };

  // Line count
  $: lines = value.split('\n').length;
</script>

<div class="editor-container">
  <div class="editor-header">
    <div class="buttons">
      {#if mode === 'json'}
        <button type="button" class="btn" on:click={formatJson} disabled={!value.trim()}>
          Format
        </button>
      {/if}
      <button type="button" class="btn" on:click={resetContent} disabled={!value.trim()}>
        Reset
      </button>
      <button type="button" class="btn copy" on:click={copyContent} disabled={!value.trim()}>
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
    <span class="line-count">{lines} lines</span>
  </div>
  
  <div class="editor" style="--max-height: {maxHeight};">
    <textarea
      bind:this={textarea}
      bind:value={value}
      on:input={handleInput}
      on:keydown={handleKeyDown}
      {rows}
      {readOnly}
      spellcheck="false"
      placeholder={mode === 'json' ? 'Enter JSON here...' : 'Enter text here...'}
    ></textarea>
  </div>
</div>

<style>
  .editor-container {
    border: 1px solid #d1d5db;
    border-radius: 6px;
    overflow: hidden;
    background: white;
  }

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    min-height: 3rem;
    box-sizing: border-box;
  }

  .buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
    font-weight: 500;
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    min-width: 60px;
  }

  .btn:not(.copy) {
    background: #007bff;
    color: white;
    border-color: #007bff;
  }

  .btn:not(.copy):hover:not(:disabled) {
    background: #0056b3;
    border-color: #004085;
  }

  .btn.copy {
    background: #28a745;
    color: white;
    border-color: #28a745;
  }

  .btn.copy:hover:not(:disabled) {
    background: #1e7e34;
    border-color: #1c7430;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  .btn:active:not(:disabled) {
    transform: translateY(1px);
  }

  .line-count {
    font-size: 0.8rem;
    color: #6c757d;
    font-weight: 500;
    white-space: nowrap;
  }

  .editor {
    max-height: var(--max-height, 300px);
    overflow: hidden;
  }

  textarea {
    width: 100%;
    height: 100%;
    min-height: 200px;
    padding: 1rem;
    border: none;
    resize: none;
    outline: none;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.5;
    tab-size: 2;
    background: white;
    color: #333;
    overflow: auto;
    box-sizing: border-box;
  }

  textarea:focus {
    background: #fafafa;
  }

  textarea::placeholder {
    color: #9ca3af;
    font-style: italic;
  }

  textarea:read-only {
    background: #f8f9fa;
    color: #6c757d;
  }

  /* Mobile responsiveness */
  @media (max-width: 640px) {
    .editor-header {
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
      padding: 0.75rem;
    }

    .buttons {
      justify-content: center;
      order: 2;
    }

    .line-count {
      text-align: center;
      order: 1;
    }

    .btn {
      flex: 1;
      min-width: 0;
      padding: 0.5rem 0.75rem;
    }

    textarea {
      font-size: 16px; /* Prevents zoom on iOS */
      padding: 0.75rem;
    }
  }

  @media (max-width: 400px) {
    .editor-header {
      padding: 0.5rem;
    }

    .btn {
      padding: 0.4rem 0.6rem;
      font-size: 0.75rem;
    }

    textarea {
      padding: 0.5rem;
    }
  }
</style>