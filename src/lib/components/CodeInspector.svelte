<script>
  import { handleTab, generateLineNumbers, highlightJson } from '$lib/utils/code-utils.js';
  import { writable } from 'svelte/store';
  import { prettifyJson } from '$lib/utils/json-utils.js';

  export let value = ''; // initial JSON / partial JSON
  export let onChange = null;
  export let readOnly = false;
  export let maxHeight = '300px'; // optional prop with default

  export let rows = 10; 
  export let cols = 50; // optional, default width

  export let mode = 'json';

  const content = writable(value);
  let textarea;
  let displayDiv;
  let gutterDiv;

  // Reactive line numbers
  let lines = generateLineNumbers(value);
  $: lines = generateLineNumbers($content);
  $: lineCount = lines.length;

  // Scroll sync
  const handleScroll = () => {
    if (displayDiv && textarea && gutterDiv) {
      displayDiv.scrollTop = textarea.scrollTop;
      displayDiv.scrollLeft = textarea.scrollLeft;
      gutterDiv.scrollTop = textarea.scrollTop; // sync vertical only
    }
  };

  const handleInput = (e) => {
    let v = e.target.value;

    if (mode === 'json') {
      // Optionally detect certain hints, e.g., starts with { or contains certain keys
      const hint = v.trim().startsWith('{'); // simple hint, can customize
      if (hint) {
        try {
          const pretty = prettifyJson(v, 2);
          v = pretty; // overwrite with prettified
        } catch (err) {
          // invalid JSON, ignore
        }
      }
    }

    content.set(v);
    if (onChange) onChange(v);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const result = handleTab(
        textarea.value,
        textarea.selectionStart,
        textarea.selectionEnd,
        e.shiftKey
      );
      textarea.value = result.text;
      textarea.selectionStart = textarea.selectionEnd = result.cursor;
      content.set(result.text);
      if (onChange) onChange(result.text);
    }
  };
</script>

<div class="code-inspector" style="--ci-max-height: {maxHeight};">
  <!-- Line numbers gutter -->
  <div class="gutter" bind:this={gutterDiv}>
    {#each lines as line}
      <div class="line-number">{line}</div>
    {/each}
  </div>

  <!-- Editor area: display + textarea -->
  <div class="editor-area">
    <!-- Display layer (syntax highlighting) -->
    <div
      class="display"
      bind:this={displayDiv}
      tabindex="0"
      role="textbox"
      aria-label="JSON editor display"
      on:click={() => textarea.focus()}
      on:keydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          textarea.focus();
        }
      }}
    >
      {@html highlightJson($content)}
    </div>

    <!-- Invisible textarea for capturing input -->
    <textarea
      bind:this={textarea}
      bind:value={$content}
      rows={rows}
      cols={cols}
      on:input={handleInput}
      on:keydown={handleKeyDown}
      on:scroll={handleScroll}
      spellcheck="false"
      {readOnly}
    ></textarea>
  </div>
</div>

<div class="linecount">{lineCount} lines</div>

<style>
/* Variables */
:root {
  --gutter-width: 3rem; /* Adjust gutter width */
  --font-size: 14px;
  --line-height: 1.5rem;
  --tab-size: 4;
}

/* Syntax highlighting classes */
:global(.key) { color: brown; }
:global(.string) { color: green; }
:global(.number) { color: blue; }
:global(.boolean) { color: purple; }
:global(.null) { color: gray; }

/* Editor layout */
.code-inspector {
  position: relative;
  display: flex;
  font-family: monospace;
  font-size: var(--font-size);
  line-height: var(--line-height);
  border: 1px solid #ccc;
  border-radius: 4px;
  min-height: 200px;
  max-height: var(--ci-max-height, 300px); /* use CSS variable */
  overflow: hidden;
}

/* Gutter for line numbers */
.gutter {
  width: var(--gutter-width);
  background: #f7f7f7;
  padding: 0.5rem;
  text-align: right;
  user-select: none;       /* prevents selection highlighting */
  pointer-events: none; 
}

/* Editor area: display + textarea */
.editor-area {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.line-number {
  line-height: var(--line-height);
  pointer-events: none;    /* ensures cursor cannot appear here */
  user-select: none;       /* cannot select line numbers */
}

/* Display layer */
.display {
  padding: 0.5rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: auto;
  position: relative;
  z-index: 1;
  pointer-events: none; 
  font-family: monospace;
  font-size: var(--font-size);
  line-height: var(--line-height);
  tab-size: var(--tab-size);
}

/* Textarea */
textarea {
  position: absolute;
  top: 0;
  left: 0;             /* fill editor-area */
  width: 100%;
  height: 100%;
  padding: 0.5rem;     /* same as display */
  border: none;
  resize: none;
  outline: none;
  font-family: monospace;
  font-size: var(--font-size);
  line-height: var(--line-height);
  background: transparent;
  color: transparent;
  caret-color: black;
  z-index: 2;
  overflow: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  tab-size: var(--tab-size);
}

/* Line count below editor */
.linecount {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
}

/* Optional: style scrollbar to match editor */
.display::-webkit-scrollbar,
textarea::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.display::-webkit-scrollbar-thumb,
textarea::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.2);
  border-radius: 3px;
}

</style>
