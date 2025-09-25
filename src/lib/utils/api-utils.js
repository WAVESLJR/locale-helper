/**
 * API utilities for translation service
 */
import axios from 'axios';
import { API_SUPPORTED_LANGUAGES } from '$lib/constants.js';

/**
 * Call the backend translation API
 * @param {Object} sourceJson - The source JSON to translate
 * @param {string} sourceLang - Source language code (e.g., 'en')
 * @param {string} targetLang - Target language code (e.g., 'fr') 
 * @param {string} service - Translation service ('deepl' or 'google')
 * @returns {Promise<Object>} - The translated JSON
 */
export async function translateJson(sourceJson, sourceLang, targetLang, service = 'deepl') {
  try {
    const response = await axios.post('/api/translate', {
      sourceJson,
      sourceLang,
      targetLang,
      service
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || `Translation failed: ${error.response.status}`;
      throw new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Translation service is not available');
    } else {
      // Something else happened
      throw new Error(`Translation failed: ${error.message}`);
    }
  }
}

/**
 * Check if a language pair is supported by a translation service
 * @param {string} sourceLang - Source language code
 * @param {string} targetLang - Target language code  
 * @param {string} service - Translation service
 * @returns {boolean} - Whether the language pair is supported
 */
export function isLanguagePairSupported(sourceLang, targetLang, service = 'deepl') {
  const supportedLangs = API_SUPPORTED_LANGUAGES[service];
  if (!supportedLangs) return false;
  
  return supportedLangs.includes(sourceLang) && supportedLangs.includes(targetLang);
}

/**
 * Get available translation services for a language pair
 * @param {string} sourceLang - Source language code
 * @param {string} targetLang - Target language code
 * @returns {string[]} - Array of available services
 */
export function getAvailableServices(sourceLang, targetLang) {
  const services = [];
  
  for (const [service, langs] of Object.entries(API_SUPPORTED_LANGUAGES)) {
    if (langs.includes(sourceLang) && langs.includes(targetLang)) {
      services.push(service);
    }
  }
  
  return services;
}