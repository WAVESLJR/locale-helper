<script>
  export let activeMode = 'json';
  export let onModeChange;
  export let modes = [
    { key: 'json', label: '{ } JSON' },
    { key: 'text', label: 'Text' }
  ];
</script>

<div class="toolbar">
  {#each modes as mode (mode.key)}
    <button 
      type="button" 
      class:active={activeMode === mode.key}
      on:click={() => onModeChange(mode.key)}
    >
      {mode.label}
    </button>
  {/each}
</div>

<style>
  .toolbar {
    display: inline-flex;
    border: 1px solid var(--color-gray-300);
    border-radius: var(--radius-md);
    overflow: hidden;
    min-width: 12rem;
    background: var(--color-white);
    box-shadow: var(--shadow-sm);
  }

  button {
    padding: var(--space-2) var(--space-4);
    border: none;
    border-radius: 0;
    background: var(--color-white);
    cursor: pointer;
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-gray-700);
    transition: all var(--transition-fast);
    flex: 1;
  }

  button:hover:not(.active) {
    background: var(--color-gray-50);
    color: var(--color-gray-900);
  }

  button.active {
    background: var(--color-primary-500);
    color: var(--color-white);
    font-weight: var(--font-semibold);
  }

  button:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary-500);
    z-index: 1;
    position: relative;
  }

  button:active:not(:disabled) {
    transform: translateY(1px);
  }

  @media (max-width: 640px) {
    .toolbar {
      min-width: 10rem;
    }
    
    button {
      padding: var(--space-2) var(--space-3);
      font-size: var(--text-xs);
    }
  }
</style>