<script>
  import { LOCALE_CODES } from '$lib/constants.js';
  import LanguageSelector from '$lib/components/LanguageSelector.svelte';
  import CodeInspector from '$lib/components/CodeInspector.svelte';  
  import CopiedMessage from '$lib/components/CopiedMessage.svelte';
  import { normalizeJson, isValidLocaleJson } from '$lib/utils/json-utils.js';
  import { sendLocaleJson } from '$lib/utils/api-utils.js';
  import { prettifyJson } from '$lib/utils/json-utils.js';

  let originalLang = LOCALE_CODES.en;
  let translateLang = LOCALE_CODES.fr;

  let inputJson = prettifyJson('{"en": {"hello": "Hi"}}');
  let outputJson = '';
  
  let copied = false;

  const handleSend = async () => {
    try {
      const normalized = normalizeJson(inputJson);
      const parsed = JSON.parse(normalized);

      if (!isValidLocaleJson(parsed)) {
        throw new Error('Invalid locale JSON (must be { key: string | nested object })');
      }

      const res = await sendLocaleJson(parsed, originalLang, translateLang);
      outputJson = res.translatedJson ?? '';
    } catch (err) {
      console.error('Send failed:', err.message);
    }
  };

  const copyTranslated = async () => {
    if (!outputJson) return;
    try {
      await navigator.clipboard.writeText(outputJson);
      copied = true;
      setTimeout(() => (copied = false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
</script>


<h1>Locale Helper</h1>

<section>
  <h2>Select Languages</h2>
  <!-- Bind values to parent -->
  <LanguageSelector bind:original={originalLang} bind:translate={translateLang} />
  <p>Original: {originalLang}, Translate: {translateLang}</p>
</section>

<section class="json-section">
  <div class="codeinspector-container">
    <div class="codeinspector-wrapper">
        <h2>Input JSON</h2>
        <CodeInspector 
            bind:value={inputJson} 
            rows={10}
        />
    </div>

    <div class="codeinspector-wrapper">
        <h2>Output JSON</h2>
        <CodeInspector
            bind:value={outputJson}
            rows={10}
            readOnly={true}
            on:click={copyTranslated}
        />
        <CopiedMessage show={copied} />
    </div>
  </div>
</section>

<section class="actions">
  <button class="btn primary" on:click={handleSend}>Send JSON</button>
  <button class="btn copy" on:click={copyTranslated}>Copy Translated</button>
  <CopiedMessage show={copied} />
</section>

<style>
.actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

button.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background 0.2s, transform 0.1s;
}

button.btn:hover {
  transform: translateY(-1px);
}

button.btn:active {
  transform: translateY(0);
}

button.btn.primary {
  background: #007bff;
  color: white;
}

button.btn.primary:hover {
  background: #0069d9;
}

button.btn.copy {
  background: #28a745;
  color: white;
}

button.btn.copy:hover {
  background: #218838;
}

/* Container for input/output code inspectors */
.codeinspector-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.codeinspector-wrapper h2 {
  margin-bottom: 0.75rem;
}

@media screen and (min-width: 750px) {
  .codeinspector-container {
    flex-direction: row;
    gap: 2rem; /* spacing between input/output */
  }

  .codeinspector-container > .codeinspector-wrapper {
    flex: 1 1 50%;
  }
}


</style>
