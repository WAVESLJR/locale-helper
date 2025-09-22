import { LOCALE_CODES } from '$lib/constants.js';
import { writable } from 'svelte/store';

/**
 * The translation store holds all stages of the translation workflow:
 * - sourceLang: original language code
 * - targetLang: target language code
 * - hashmap: { 'key1.key2': 'string value', ... } from JSON
 * - sourceJson: raw JSON input (fixed if partial)
 * - sourceText: array of strings extracted from sourceJson for translator
 * - responseText: array of translated strings returned from translator
 * - responseJson: final JSON reconstructed from responseText and hashmap
 */
function createTranslationStore() {
  const { subscribe, set, update } = writable({
    sourceLang: LOCALE_CODES.en,     // default source language
    targetLang: LOCALE_CODES.fr,     // default target language
    hashmap: {},                     // key -> value map for strings
    sourceJson: {},                  // original JSON
    sourceText: [],                  // extracted string values
    responseText: [],                // translated strings
    responseJson: {}                 // remapped translated JSON
  });

  return {
    subscribe,

    // Reset everything
    reset: () => set({
      sourceLang: LOCALE_CODES.en,
      targetLang: LOCALE_CODES.fr,
      hashmap: {},
      sourceJson: {},
      sourceText: [],
      responseText: [],
      responseJson: {}
    }),

    // Update languages
    setLanguages: (source, target) => update(state => ({
      ...state,
      sourceLang: source,
      targetLang: target
    })),

    // Update source JSON and automatically generate hashmap + sourceText
    setSourceJson: (jsonObj, generateSourceTextFn) => update(state => {
      const hashmap = generateSourceTextFn(jsonObj); // returns { 'key1.key2': 'value' }
      const sourceText = Object.values(hashmap);
      return {
        ...state,
        sourceJson: jsonObj,
        hashmap,
        sourceText
      };
    }),

    // Update response text
    setResponseText: (textArr) => update(state => ({
      ...state,
      responseText: textArr
    })),

    // Update final response JSON
    setResponseJson: (jsonObj) => update(state => ({
      ...state,
      responseJson: jsonObj
    }))
  };
}

export const translationStore = createTranslationStore();
