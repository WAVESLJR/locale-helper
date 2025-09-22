// lib/utils/language-utils.js
import { API_SUPPORTED_LANGUAGES } from '$lib/constants.js';

export function isLanguageSupported(lang, api = 'google') {
  const list = API_SUPPORTED_LANGUAGES[api.toLowerCase()];
  if (!list) throw new Error(`Unknown API: ${api}`);
  return list.includes(lang);
}

export function getSupportedLanguages(api = 'google') {
  const list = API_SUPPORTED_LANGUAGES[api.toLowerCase()];
  if (!list) throw new Error(`Unknown API: ${api}`);
  return list;
}
