<script>
  import { LOCALE_CODES } from '$lib/constants.js';
  import LanguageSelector from '$lib/components/LanguageSelector.svelte';
  import CodeInspector from '$lib/components/CodeInspector.svelte';
  import CopiedMessage from '$lib/components/CopiedMessage.svelte';
  import WorkflowStatus from '$lib/components/WorkflowStatus.svelte';
  import PanelSwitcher from '$lib/components/PanelSwitcher.svelte';
  import TranslationActions from '$lib/components/TranslationActions.svelte';

  import { prettifyJson, normalizeJson, isValidLocaleJson, fixJsonIssues } from '$lib/utils/json-utils.js';
  import {
    extractStrings,
    prepareTranslatorText,
    mapTranslatedBack,
    validateTranslations,
    expandKeyMapToJson
  } from '$lib/utils/translate-utils.js';
  import { translateLocaleJson } from '$lib/services/translation-service.js';
  import { isLanguagePairSupported, getAvailableServices } from '$lib/utils/api-utils.js';

  let originalLang = LOCALE_CODES.en;
  let translateLang = LOCALE_CODES.fr;

  // Inspector modes
  let inputMode = 'json';
  let outputMode = 'text';

  // Workflow data
  let inputJsonString = prettifyJson({"greeting": "Hello {name}!", "farewell": "Goodbye {name}, see you {when}."});
  let responseTextString = '';
  
  // Internal processing data
  let extractedStrings = [];
  let sourceText = '';
  let responseJson = '';

  // Translation state
  let isTranslating = false;
  let translationProgress = '';
  let availableServices = [];

  // UI state
  let copied = false;
  let errorMessage = '';
  let successMessage = '';

  // Update available services when languages change
  $: availableServices = getAvailableServices(originalLang, translateLang);
  $: canTranslate = availableServices.length > 0;

  // Reactive values for binding inspectors
  $: inputValue = inputMode === 'json' ? inputJsonString : responseTextString;
  $: outputValue = getOutputValue();

  function getOutputValue() {
    if (outputMode === 'json') {
      return responseJson;
    } else {
      return sourceText;
    }
  }

  // Update input values
  function updateInputValue(val) {
    clearMessages();
    if (inputMode === 'json') {
      inputJsonString = val;
    } else {
      responseTextString = val;
    }
  }

  // Update output (read-only, but needed for binding)
  function updateOutputValue(val) {
    // Output is read-only
  }

  // Step 1: Extract strings from input JSON
  function handleExtract() {
    clearMessages();
    try {
      let jsonToProcess = inputJsonString.trim();
      if (!jsonToProcess) {
        throw new Error('Please enter some JSON to process');
      }

      let parsedJson;
      try {
        parsedJson = JSON.parse(jsonToProcess);
      } catch (parseError) {
        const fixed = fixJsonIssues(jsonToProcess);
        try {
          parsedJson = JSON.parse(fixed);
          inputJsonString = prettifyJson(parsedJson);
          successMessage = 'JSON was automatically fixed and formatted';
        } catch (fixedError) {
          throw new Error(`Invalid JSON: ${parseError.message}`);
        }
      }

      if (!isValidLocaleJson(parsedJson)) {
        throw new Error('Invalid locale JSON: Only objects and strings are allowed');
      }

      extractedStrings = extractStrings(parsedJson);
      
      if (extractedStrings.length === 0) {
        throw new Error('No translatable strings found in the JSON');
      }

      sourceText = prepareTranslatorText(extractedStrings);

      outputMode = 'text';
      outputValue = getOutputValue()
      
      successMessage = `Extracted ${extractedStrings.length} strings for translation`;
      
    } catch (err) {
      errorMessage = err.message;
      console.error('Extract failed:', err);
    }
  }

  // Step 2: Auto-translate using API
  const handleAutoTranslate = async () => {
    clearMessages();
    
    if (!canTranslate) {
      errorMessage = `Translation not supported for ${originalLang} → ${translateLang}`;
      return;
    }

    if (extractedStrings.length === 0) {
      errorMessage = 'Please extract strings from JSON first';
      return;
    }

    isTranslating = true;
    translationProgress = 'Connecting to translation service...';

    try {
      let sourceJsonObj;
      try {
        sourceJsonObj = JSON.parse(inputJsonString);
      } catch (e) {
        throw new Error('Invalid source JSON');
      }

      translationProgress = 'Translating strings...';
      
      const service = availableServices.includes('deepl') ? 'deepl' : availableServices[0];
      
      const result = await translateLocaleJson(sourceJsonObj, originalLang, translateLang, service);

      if (!result.success) {
        throw new Error(result.error);
      }

      responseJson = prettifyJson(result.data);
      outputMode = 'json';
      successMessage = `${result.message} using ${service.toUpperCase()}`;

    } catch (err) {
      errorMessage = `Auto-translation failed: ${err.message}. Try the manual workflow: use the extracted text below to translate manually.`;
      console.error('Auto-translate error:', err);
    } finally {
      isTranslating = false;
      translationProgress = '';
    }
  };

  // Step 3: Rebuild JSON from translated text
  function handleRebuild() {
    clearMessages();
    try {
      if (extractedStrings.length === 0) {
        throw new Error('Please extract strings from JSON first');
      }

      const textToProcess = responseTextString.trim();
      if (!textToProcess) {
        throw new Error('Please enter translated text to process');
      }

      const translatedLines = textToProcess.split('\n')
        .map(line => line.trim())
        .filter(line => line !== '');

      const validation = validateTranslations(extractedStrings, translatedLines);
      if (!validation.valid) {
        throw new Error(`Translation validation failed: ${validation.error}`);
      }

      const mapped = mapTranslatedBack(extractedStrings, translatedLines);
      const expandedJson = expandKeyMapToJson(mapped);
      
      responseJson = prettifyJson(expandedJson);
      outputMode = 'json';
      outputValue = getOutputValue()
      
      successMessage = `Successfully rebuilt JSON with ${translatedLines.length} translated strings`;

    } catch (err) {
      errorMessage = err.message;
      console.error('Rebuild failed:', err);
    }
  }

  // Copy helper
  async function copyOutput() {
    const text = outputValue;
    if (!text) {
      errorMessage = 'Nothing to copy';
      return;
    }
    
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      setTimeout(() => (copied = false), 1500);
    } catch (err) {
      errorMessage = 'Failed to copy to clipboard';
      console.error('Failed to copy:', err);
    }
  }

  function clearMessages() {
    errorMessage = '';
    successMessage = '';
  }

  function switchInputMode(newMode) {
    inputMode = newMode;
    clearMessages();
  }

  function switchOutputMode(newMode) {
    outputMode = newMode;
    clearMessages();
  }

  function handleReset() {
    inputJsonString = prettifyJson({"greeting": "Hello {name}!", "farewell": "Goodbye {name}, see you {when}."});
    responseTextString = '';
    extractedStrings = [];
    sourceText = '';
    responseJson = '';
    inputMode = 'json';
    outputMode = 'text';
    isTranslating = false;
    translationProgress = '';
    clearMessages();
  }
</script>

<div class="main-translator">
  <section class="language-section">
    <h2>Select Languages</h2>
    <LanguageSelector bind:original={originalLang} bind:translate={translateLang} />
    <p>Translating from <strong>{originalLang}</strong> to <strong>{translateLang}</strong></p>
  </section>

  <section class="content-section">
    {#if errorMessage}
      <div class="error">{errorMessage}</div>
    {/if}
    
    {#if successMessage}
      <div class="success">{successMessage}</div>
    {/if}

    <div class="panels-container">
      <!-- Input Panel -->
      <div class="panel">
        <div class="panel-header">
          <h3>Input</h3>
          <PanelSwitcher 
            activeMode={inputMode}
            onModeChange={switchInputMode}
          />
        </div>
        <CodeInspector
          value={inputValue}
          onChange={updateInputValue}
          mode={inputMode}
          rows={12}
          maxHeight="400px"
        />
        {#if inputMode === 'json'}
          <div class="helper-text">
            Enter your locale JSON here. Example: {{"welcome": "Hello {name}!"}}
          </div>
        {:else}
          <div class="helper-text">
            {#if sourceText}
              Source text for translation (copy this to translate manually)
            {:else}
              Switch to JSON mode to input your source JSON first
            {/if}
          </div>
        {/if}
      </div>

      <!-- Output Panel -->
      <div class="panel">
        <div class="panel-header">
          <h3>Output</h3>
          <PanelSwitcher 
            activeMode={outputMode}
            onModeChange={switchOutputMode}
          />
        </div>
        <CodeInspector
          value={outputValue}
          onChange={updateOutputValue}
          rows={12}
          mode={outputMode}
          readOnly={true}
          maxHeight="400px"
        />
        {#if outputMode === 'text'}
          <div class="helper-text">
            {#if responseTextString}
              Paste your translated text here (one line per translation), then click "Rebuild JSON"
            {:else}
              Translated text output - paste your manual translations here
            {/if}
          </div>
        {:else}
          <div class="helper-text">
            {#if responseJson}
              Your final translated JSON. Copy this to use in your application.
            {:else}
              JSON output will appear here after auto-translation or manual rebuild.
            {/if}
          </div>
        {/if}
        <CopiedMessage show={copied} />
      </div>
    </div>
  </section>

  <TranslationActions
    canExtract={!!inputJsonString.trim()}
    canAutoTranslate={canTranslate && extractedStrings.length > 0}
    canRebuild={!!responseTextString.trim() && extractedStrings.length > 0}
    canCopy={!!outputValue}
    {isTranslating}
    onExtract={handleExtract}
    onAutoTranslate={handleAutoTranslate}
    onRebuild={handleRebuild}
    onCopy={copyOutput}
    onReset={handleReset}
  />

  <!-- Translation Progress -->
  {#if isTranslating && translationProgress}
    <section class="progress">
      <div class="progress-message">
        {translationProgress}
      </div>
    </section>
  {/if}

  <!-- Language Support Info -->
  {#if !canTranslate && originalLang && translateLang}
    <section class="language-warning">
      <div class="warning">
        Translation not available for {originalLang} → {translateLang}
      </div>
    </section>
  {:else if availableServices.length > 0}
    <section class="service-info">
      <div class="info-text">
        Available services: {availableServices.map(s => s.toUpperCase()).join(', ')}
      </div>
    </section>
  {/if}

  <WorkflowStatus
    extractedCount={extractedStrings.length}
    hasResult={!!responseJson}
  />
</div>

<style>
  .main-translator {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-4);
    background: var(--color-white);
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-xl);
  }

  .language-section {
    margin-bottom: var(--space-8);
  }

  .language-section h2 {
    color: var(--color-gray-800);
    margin-bottom: var(--space-4);
  }

  .language-section p {
    color: var(--color-gray-600);
    font-size: var(--text-base);
  }

  .content-section {
    margin-bottom: var(--space-8);
  }

  .panels-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .panel {
    flex: 1;
  }

  .panel-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin-bottom: var(--space-3);
  }

  .panel-header h3 {
    color: var(--color-gray-800);
    font-size: var(--text-xl);
    font-weight: var(--font-semibold);
    margin-bottom: 0;
  }

  .helper-text {
    font-size: var(--text-sm);
    color: var(--color-gray-600);
    margin-top: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--color-gray-50);
    border-radius: var(--radius);
    border-left: 3px solid var(--color-primary-500);
  }

  @media screen and (min-width: 750px) {
    .panels-container {
      flex-direction: row;
    }
    .panel-header {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }

  /* Messages */
  .error {
    color: var(--color-error-700);
    background: var(--color-error-50);
    border: 1px solid var(--color-error-200);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    margin-bottom: var(--space-4);
    font-weight: var(--font-medium);
  }

  .success {
    color: var(--color-success-700);
    background: var(--color-success-50);
    border: 1px solid var(--color-success-200);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    margin-bottom: var(--space-4);
    font-weight: var(--font-medium);
  }

  /* Progress section */
  .progress {
    margin-top: var(--space-6);
    padding: var(--space-6);
    background: var(--color-primary-50);
    border: 1px solid var(--color-primary-200);
    border-radius: var(--radius-lg);
    text-align: center;
  }

  .progress-message {
    color: var(--color-primary-700);
    font-weight: var(--font-medium);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    font-size: var(--text-base);
  }

  .progress-message::before {
    content: "⏳";
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* Language support info */
  .language-warning {
    margin-top: var(--space-6);
  }

  .warning {
    color: var(--color-error-700);
    background: var(--color-error-50);
    border: 1px solid var(--color-error-200);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    text-align: center;
    font-weight: var(--font-medium);
  }

  .service-info {
    margin-top: var(--space-3);
  }

  .info-text {
    color: var(--color-primary-600);
    font-size: var(--text-sm);
    text-align: center;
    font-weight: var(--font-medium);
    padding: var(--space-2);
    background: var(--color-primary-50);
    border-radius: var(--radius);
  }
</style>