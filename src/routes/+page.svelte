<script>
  import MainTranslator from '$lib/components/MainTranslator.svelte';
</script>

<svelte:head>
  <title>Locale Helper - JSON Translation Tool</title>
  <meta name="description" content="Translate locale JSON files between languages using DeepL and Google Translate APIs" />
</svelte:head>

<main>
  <header>
    <h1>Locale Helper</h1>
    <p class="subtitle">Translate JSON locale files with ease</p>
  </header>

  <MainTranslator />
</main>

<style>
  main {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    padding: 2rem 1rem;
  }

  header {
    text-align: center;
    margin-bottom: 3rem;
    color: white;
  }

  h1 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
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