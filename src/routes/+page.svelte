<script>
  import MainTranslator from '$lib/components/MainTranslator.svelte';
</script>

<svelte:head>
  <title>Locale Helper - JSON Translation Tool</title>
  <meta name="description" content="Translate locale JSON files between languages using DeepL and Google Translate APIs" />
</svelte:head>

<main>
  <header>
    <h1>
      <span>{ `Locale`.toUpperCase() }</span>
      <img src="/logo.svg" alt="App Logo" />
      <span>{ `Helper`.toUpperCase() }</span>
    </h1>
    <p class="subtitle">Translate JSON locale files with ease</p>
  </header>

  <MainTranslator />
</main>

<style>
  main {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--color-gray-100) 0%, var(--color-gray-200) 100%);
    padding: 2rem 1rem;
  }

  header {
    text-align: center;
    margin-bottom: 3rem;
    color: var(--color-gray-800);
  }

  h1 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-shadow: 2px 2px 4px rgba(var(--color-black),0.3);
    display: inline-block;
  }

  h1 > * {
    display: inline;
    height: 5rem;
    aspect-ratio: 1 / 1;
    font-size: 4rem;
  }

  .subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    font-weight: 300;
  }

  @media (max-width: 768px) {
    main {
      padding: 1rem 0.5rem;
    }
    
    h1 {
      font-size: 2rem;
    }
    
    .subtitle {
      font-size: 1rem;
    }
  }
</style>