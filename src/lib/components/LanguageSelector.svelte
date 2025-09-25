<script>
  import { LOCALE_CODES, LANGUAGE_NAMES } from '$lib/constants.js';
  import { onMount, createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let dropdownOriginal;
  let dropdownTranslate;

  // Generate sorted array of locale codes with full names
  export let languages = Object.keys(LOCALE_CODES)
    .map(code => ({ code, name: LANGUAGE_NAMES[code] || code }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Default selections from constants
  export let original = Object.keys(LOCALE_CODES)[5]; // 'en'
  export let translate = Object.keys(LOCALE_CODES)[8]; // 'fr'

  let openOriginal = false;
  let openTranslate = false;

  // Get display name for a language code
  $: getDisplayName = (code) => {
    const lang = languages.find(l => l.code === code);
    return lang ? `${lang.name}` : code.toUpperCase();
  };

  const selectOriginal = (langCode) => {
    if (langCode === translate) return;
    original = langCode;
    openOriginal = false;
    dispatch('change', { original, translate });
  };

  const selectTranslate = (langCode) => {
    if (langCode === original) return;
    translate = langCode;
    openTranslate = false;
    dispatch('change', { original, translate });
  };

  // Swap languages
  const swapLanguages = () => {
    const temp = original;
    original = translate;
    translate = temp;
    dispatch('change', { original, translate });
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
    return () => document.removeEventListener('click', handleClickOutside);
  });
</script>

<section>
  <!-- Original language -->
  <div>
    <label for="original-lang">From</label>
    <div class="dropdown" bind:this={dropdownOriginal}>
      <button
        type="button"
        id="original-lang"
        class:open={openOriginal}
        on:click={() => (openOriginal = !openOriginal)}
      >
        <span>{getDisplayName(original)}</span>
        <svg class:rotated={openOriginal} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </button>
      {#if openOriginal}
        <ul>
          {#each languages as lang (lang.code)}
            <li>
              <button
                type="button"
                class:disabled={lang.code === translate}
                class:active={lang.code === original}
                on:click={() => selectOriginal(lang.code)}
                disabled={lang.code === translate}
                aria-label="Select {lang.name} as source language"
              >
                <small>{lang.code.toUpperCase()}</small>
                <span>{lang.name}</span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>

  <!-- Swap button -->
  <button 
    type="button" 
    class="swap" 
    on:click={swapLanguages}
    title="Swap languages"
    aria-label="Swap source and target languages"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M17 2l4 4-4 4"/>
      <path d="M3 6h18"/>
      <path d="M7 22l-4-4 4-4"/>
      <path d="M21 18H3"/>
    </svg>
  </button>

  <!-- Target language -->
  <div>
    <label for="target-lang">To</label>
    <div class="dropdown" bind:this={dropdownTranslate}>
      <button
        type="button"
        id="target-lang"
        class:open={openTranslate}
        on:click={() => (openTranslate = !openTranslate)}
      >
        <span>{getDisplayName(translate)}</span>
        <svg class:rotated={openTranslate} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </button>
      {#if openTranslate}
        <ul>
          {#each languages as lang (lang.code)}
            <li>
              <button
                type="button"
                class:disabled={lang.code === original}
                class:active={lang.code === translate}
                on:click={() => selectTranslate(lang.code)}
                disabled={lang.code === original}
                aria-label="Select {lang.name} as target language"
              >
                <small>{lang.code.toUpperCase()}</small>
                <span>{lang.name}</span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</section>

<style>
  section {
    display: flex;
    align-items: flex-end;
    gap: var(--space-3);
    max-width: 600px;
    font-family: var(--font-family-sans);
  }

  section > div {
    flex: 1;
    min-width: 0;
  }

  label {
    display: block;
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-gray-700);
    margin-bottom: var(--space-1);
  }

  .dropdown {
    position: relative;
  }

  .dropdown > button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3) var(--space-4);
    background: var(--color-white);
    border: 2px solid var(--color-gray-300);
    border-radius: var(--radius-lg);
    font-size: var(--text-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
    min-height: 48px;
    box-shadow: var(--shadow-sm);
  }

  .dropdown > button:hover {
    border-color: var(--color-gray-400);
    background: var(--color-gray-50);
  }

  .dropdown > button:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .dropdown > button.open {
    border-color: var(--color-primary-500);
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .dropdown > button > span {
    flex: 1;
    text-align: left;
    font-weight: var(--font-medium);
    color: var(--color-gray-800);
  }

  .dropdown > button > svg {
    width: 20px;
    height: 20px;
    color: var(--color-gray-500);
    transition: transform var(--transition-fast);
  }

  .dropdown > button > svg.rotated {
    transform: rotate(180deg);
  }

  ul {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: var(--z-dropdown);
    background: var(--color-white);
    border: 2px solid var(--color-primary-500);
    border-top: none;
    border-bottom-left-radius: var(--radius-lg);
    border-bottom-right-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    max-height: 300px;
    overflow-y: auto;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    transition: background-color var(--transition-fast);
    font-size: var(--text-sm);
  }

  li button:hover:not(:disabled) {
    background: var(--color-gray-100);
  }

  li button:focus {
    outline: none;
    background: var(--color-primary-50);
  }

  li button.active {
    background: var(--color-primary-100);
    color: var(--color-primary-700);
  }

  li button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--color-gray-50);
  }

  small {
    font-weight: var(--font-semibold);
    font-family: var(--font-family-mono);
    font-size: var(--text-xs);
    color: var(--color-gray-500);
    min-width: 28px;
  }

  li button.active small {
    color: var(--color-primary-600);
  }

  li button span {
    flex: 1;
    color: var(--color-gray-700);
  }

  li button.active span {
    color: var(--color-primary-700);
    font-weight: var(--font-medium);
  }

  .swap {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-white);
    border: 2px solid var(--color-gray-300);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all var(--transition-fast);
    box-shadow: var(--shadow-sm);
  }

  .swap:hover {
    border-color: var(--color-gray-400);
    background: var(--color-gray-50);
    box-shadow: var(--shadow);
  }

  .swap:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .swap:active {
    transform: scale(0.95);
  }

  .swap svg {
    width: 20px;
    height: 20px;
    color: var(--color-gray-600);
  }

  .swap:hover svg {
    color: var(--color-gray-800);
  }

  @media (max-width: 640px) {
    section {
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-4);
    }

    .swap {
      align-self: center;
      transform: rotate(90deg);
    }
  }

  ul::-webkit-scrollbar {
    width: 6px;
  }

  ul::-webkit-scrollbar-track {
    background: var(--color-gray-100);
  }

  ul::-webkit-scrollbar-thumb {
    background: var(--color-gray-400);
    border-radius: var(--radius-sm);
  }

  ul::-webkit-scrollbar-thumb:hover {
    background: var(--color-gray-500);
  }
</style>