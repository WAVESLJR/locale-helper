<script>
  export let canExtract = false;
  export let canAutoTranslate = false;
  export let canRebuild = false;
  export let canCopy = false;
  export let isTranslating = false;
  export let onExtract;
  export let onAutoTranslate;
  export let onRebuild;
  export let onCopy;
  export let onReset;
</script>

<div class="actions">
  <button on:click={onExtract} disabled={!canExtract}>
    1. Extract Text
  </button>
  
  <button 
    class="auto-translate"
    on:click={onAutoTranslate} 
    disabled={!canAutoTranslate || isTranslating}
  >
    {isTranslating ? 'Translating...' : 'Auto Translate'}
  </button>
  
  <button on:click={onRebuild} disabled={!canRebuild}>
    2. Rebuild JSON
  </button>
  
  <button class="copy" on:click={onCopy} disabled={!canCopy}>
    Copy Output
  </button>
  
  <button class="secondary" on:click={onReset}>
    Reset
  </button>
</div>

<style>
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
    flex-wrap: wrap;
    margin-top: var(--space-4);
  }

  button {
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    border: 1px solid transparent;
    cursor: pointer;
    font-weight: var(--font-medium);
    font-size: var(--text-sm);
    transition: all var(--transition-fast);
    box-shadow: var(--shadow-sm);
    background: var(--color-primary-500);
    color: var(--color-white);
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  button:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary-500);
  }

  button:hover:not(:disabled) {
    background: var(--color-primary-600);
    box-shadow: var(--shadow);
  }

  button:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: var(--shadow-sm);
  }

  button.auto-translate {
    background: #6f42c1;
  }

  button.auto-translate:hover:not(:disabled) {
    background: #5a2d91;
  }

  button.auto-translate:disabled {
    background: var(--color-gray-400);
  }

  button.copy {
    background: var(--color-success-500);
  }

  button.copy:hover:not(:disabled) {
    background: var(--color-success-600);
  }

  button.secondary {
    background: var(--color-gray-500);
  }

  button.secondary:hover:not(:disabled) {
    background: var(--color-gray-600);
  }

  @media (max-width: 640px) {
    .actions {
      justify-content: center;
    }

    button {
      flex: 1;
      min-width: 0;
      padding: var(--space-3);
      font-size: var(--text-xs);
    }
  }

  @media (max-width: 400px) {
    .actions {
      flex-direction: column;
    }

    button {
      width: 100%;
    }
  }
</style>