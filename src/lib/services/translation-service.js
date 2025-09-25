/**
 * Translation service integration
 */
import { translateJson, isLanguagePairSupported } from '$lib/utils/api-utils.js';

/**
 * Complete translation workflow - from source JSON to translated JSON
 * @param {Object} sourceJson - The source JSON object
 * @param {string} sourceLang - Source language code
 * @param {string} targetLang - Target language code
 * @param {string} service - Translation service ('deepl' or 'google')
 * @returns {Promise<Object>} - Result object with success status and data
 */
export async function translateLocaleJson(sourceJson, sourceLang, targetLang, service = 'deepl') {
  try {
    // Validate language support
    if (!isLanguagePairSupported(sourceLang, targetLang, service)) {
      throw new Error(`Language pair ${sourceLang} → ${targetLang} not supported by ${service}`);
    }

    // Call backend API with the complete source JSON
    const result = await translateJson(sourceJson, sourceLang, targetLang, service);

    if (!result.success) {
      throw new Error(result.message || 'Translation failed');
    }

    return {
      success: true,
      data: result.translatedJson,
      message: `Successfully translated ${result.stringCount || 0} strings`
    };

  } catch (error) {
    console.error('Translation service error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Check translation service status
 * @param {string} service - Service to check
 * @returns {Promise<boolean>} - Whether service is available
 */
export async function checkServiceHealth(service = 'deepl') {
  try {
    const response = await axios.get(`/api/translate/health?service=${service}`);
    return response.data.healthy === true;
  } catch (error) {
    console.warn(`Service ${service} health check failed:`, error.message);
    return false;
  }
}