<script>
  import { LOCALE_CODES } from '$lib/constants.js';
  import { onMount, onDestroy } from 'svelte';

  let dropdownOriginal;
  let dropdownTranslate;

  // Generate sorted array of locale codes
  export let languages = Object.keys(LOCALE_CODES).sort();

  // Default selections
  export let original = languages[0];
  export let translate = languages[1];

  let openOriginal = false;
  let openTranslate = false;

    const selectOriginal = (lang) => {
    if (lang === translate) return; // prevent selecting same as translate
    original = lang;
    openOriginal = false;
    };

    const selectTranslate = (lang) => {
    if (lang === original) return; // prevent selecting same as original
    translate = lang;
    openTranslate = false;
    };

    const handleClickOutside = (event) => {
    if (dropdownOriginal && !dropdownOriginal.contains(event.target)) {
      openOriginal = false;
    }
    if (dropdownTranslate && !dropdownTranslate.contains(event.target)) {
      openTranslate = false;
    }
  };

    onMount(() => {
        document.addEventListener('click', handleClickOutside);

        // Cleanup when component is destroyed
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    });
</script>


<div class="language-selector-inline">
  <!-- Original language dropdown -->
  <div class="dropdown" bind:this={dropdownOriginal}>
    <div class="selected" on:click={() => (openOriginal = !openOriginal)}>
      {original}
    </div>
    {#if openOriginal}
      <ul class="dropdown-menu">
        {#each languages as lang}
          <li>
            <button
                type="button"
                on:click={() => selectOriginal(lang)}
                class:disabled={lang === translate}
            >
                {lang}
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  <span class="arrow">➡️</span>

  <!-- Translate language dropdown -->
  <div class="dropdown" bind:this={dropdownTranslate}>
    <div class="selected" on:click={() => (openTranslate = !openTranslate)}>
      {translate}
    </div>
    {#if openTranslate}
      <ul class="dropdown-menu">
        {#each languages as lang}
          <li>
            <button type="button"
                on:click={() => selectTranslate(lang)}
                class:disabled={lang === original}
            >
              {lang}
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style>
.language-selector-inline {
  /* Scoped CSS variables for this component only */
  --font-family: monospace;
  --font-size: 1rem;
  --arrow-size: 1.4rem;
  --selected-padding: 0.5rem 1rem;
  --selected-bg: #f9f9f9;
  --selected-border-radius: 6px;
  --selected-border: 1px solid #ccc;
  --gap: 0.75rem;
  --dropdown-max-height: 250px;
  --dropdown-item-padding: 0.5rem 1rem;
  --dropdown-item-hover-bg: #f0f0f0;

  display: flex;
  align-items: center;
  gap: var(--gap);
  font-family: var(--font-family);
  font-size: var(--font-size);
}

.dropdown {
  position: relative;
}

.selected {
  cursor: pointer;
  padding: var(--selected-padding);
  border: var(--selected-border);
  border-radius: var(--selected-border-radius);
  background: var(--selected-bg);
  min-width: 70px;
  text-align: center;
  font-size: var(--font-size);
}

.arrow {
  user-select: none;
  font-size: var(--arrow-size);
}

.dropdown-menu {
  margin: 0;
  padding: 0;
  list-style: none;
  border: var(--selected-border);
  border-radius: var(--selected-border-radius);
  background: white;
  position: absolute;
  z-index: 10;
  width: 100%;           /* match the selected box width */
  max-height: var(--dropdown-max-height);
  overflow-y: auto;
  overflow-x: hidden;    /* hide horizontal scrollbar */
  box-sizing: border-box; /* include padding in width calculation */
}


.dropdown-menu li button {
  all: unset;
  display: block;             /* fills the li width */
  width: 100%;
  box-sizing: border-box;     /* include padding in width */
  text-align: left;           /* left-aligned text */
  padding: var(--dropdown-item-padding); /* comfortable left/right padding */
  cursor: pointer;
  font-size: var(--font-size);
  white-space: nowrap;        /* prevent text wrap */
}

.dropdown-menu li button:hover,
.dropdown-menu li button:focus {
  background: var(--dropdown-item-hover-bg);
}

/* Disabled option style */
.dropdown-menu li button.disabled {
  color: rgba(0, 0, 0, 0.5);
  background: #e0e0e0;       /* muted background */
  cursor: not-allowed;
}

/* Ensure hover/focus does not override disabled */
.dropdown-menu li button:not(.disabled):hover,
.dropdown-menu li button:not(.disabled):focus {
  background: var(--dropdown-item-hover-bg, #f0f0f0);
}

.dropdown-menu::-webkit-scrollbar {
  width: 6px; /* smaller vertical scrollbar */
  height: 6px; /* just in case horizontal appears */
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.3);
  border-radius: 3px;
}
</style>
