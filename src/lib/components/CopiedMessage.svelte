<script>
  export let show = false;
  export let message = 'Copied!';
</script>

{#if show}
  <div>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
    <span>{message}</span>
  </div>
{/if}

<style>
  div {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-2) var(--space-3);
    background: var(--color-success-100);
    color: var(--color-success-700);
    border: 1px solid var(--color-success-200);
    border-radius: var(--radius);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    transition: all var(--transition-fast);
    position: absolute;
    top: -2.5rem;
    right: 0;
    white-space: nowrap;
    z-index: var(--z-tooltip);
    box-shadow: var(--shadow);
    animation: slideIn var(--transition-normal) ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  span {
    line-height: 1;
  }
</style>