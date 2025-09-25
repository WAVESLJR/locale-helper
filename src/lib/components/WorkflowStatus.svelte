<script>
  export let extractedCount = 0;
  export let hasResult = false;
</script>

<section>
  <div class:completed={extractedCount > 0}>
    <span>1</span>
    <span>Extract ({extractedCount} strings)</span>
  </div>
  <div>→</div>
  <div class:completed={hasResult}>
    <span>2</span>
    <span>Translate</span>
  </div>
</section>

<style>
  section {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--color-gray-50);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-lg);
    margin-top: var(--space-6);
  }

  div {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-full);
    background: var(--color-gray-200);
    color: var(--color-gray-600);
    transition: all var(--transition-normal);
    box-shadow: var(--shadow-sm);
  }

  div:nth-child(2) {
    background: none;
    box-shadow: none;
    padding: 0;
    font-size: var(--text-xl);
    color: var(--color-gray-400);
  }

  div.completed {
    background: var(--color-success-500);
    color: var(--color-white);
    box-shadow: var(--shadow);
  }

  div.completed + div {
    color: var(--color-success-500);
  }

  span:first-child {
    background: rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-full);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--font-bold);
    font-size: var(--text-sm);
  }

  span:last-child {
    font-weight: var(--font-medium);
    font-size: var(--text-sm);
  }

  @media (max-width: 640px) {
    section {
      gap: var(--space-2);
    }

    div {
      padding: var(--space-2) var(--space-3);
    }

    span:first-child {
      width: 20px;
      height: 20px;
      font-size: var(--text-xs);
    }

    span:last-child {
      font-size: var(--text-xs);
    }

    div:nth-child(2) {
      font-size: var(--text-lg);
    }
  }
</style>