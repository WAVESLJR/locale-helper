<script>
  export let show = false; // whether to display the message
  export let message = 'Copied!'; // default text
</script>

{#if show}
  <span class="copied-msg">{message}</span>
{/if}

<style>
.copied-msg {
  margin-left: 0.5rem;
  font-size: 0.9rem;
  color: #28a745;
  font-weight: 500;
  transition: opacity 0.2s;
}
</style>
