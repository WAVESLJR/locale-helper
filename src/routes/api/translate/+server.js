import { json, error } from '@sveltejs/kit';
import axios from 'axios';
import { extractStrings, prepareTranslatorText, mapTranslatedBack, expandKeyMapToJson } from '$lib/utils/translate-utils.js';
import { isValidLocaleJson } from '$lib/utils/json-utils.js';
import { API_SUPPORTED_LANGUAGES } from '$lib/constants.js';
import { env } from '$env/dynamic/private';

// API URLs
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate'; // Use api.deepl.com for paid plans
const GOOGLE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

/**
 * Validate required environment variables
 */
function validateEnvironment(service) {
  if (service === 'deepl' && !env.DEEPL_API_KEY) {
    throw new Error('DEEPL_API_KEY environment variable is required for DeepL service');
  }
  if (service === 'google' && !env.GOOGLE_TRANSLATE_API_KEY) {
    throw new Error('GOOGLE_TRANSLATE_API_KEY environment variable is required for Google service');
  }
}

/**
 * Validate language support for the specified service
 */
function validateLanguageSupport(sourceLang, targetLang, service) {
  const supportedLangs = API_SUPPORTED_LANGUAGES[service];
  
  if (!supportedLangs) {
    throw new Error(`Service ${service} is not supported`);
  }
  
  if (!supportedLangs.includes(sourceLang)) {
    throw new Error(`Source language ${sourceLang} not supported by ${service}`);
  }
  
  if (!supportedLangs.includes(targetLang)) {
    throw new Error(`Target language ${targetLang} not supported by ${service}`);
  }
}

/**
 * Call DeepL API to translate text
 * DeepL API expects JSON body, not form data
 */
async function translateWithDeepL(text, sourceLang, targetLang) {
  try {
    // DeepL expects uppercase language codes
    const sourceCode = sourceLang.toUpperCase();
    const targetCode = targetLang.toUpperCase();

    const response = await axios.post(DEEPL_API_URL, {
      text: [text], // DeepL expects an array of texts
      source_lang: sourceCode,
      target_lang: targetCode,
      preserve_formatting: true,
      tag_handling: 'xml'
    }, {
      headers: {
        'Authorization': `DeepL-Auth-Key ${env.DEEPL_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.data.translations || response.data.translations.length === 0) {
      throw new Error('No translation returned from DeepL API');
    }

    return response.data.translations[0].text;
  } catch (err) {
    if (err.response) {
      const message = err.response.data?.message || `DeepL API error: ${err.response.status}`;
      throw new Error(message);
    } else if (err.request) {
      throw new Error('DeepL API is not available');
    } else {
      throw new Error(`DeepL translation failed: ${err.message}`);
    }
  }
}

/**
 * Call Google Translate API to translate text
 * Google Translate v2 API with proper endpoint and parameters
 */
async function translateWithGoogle(text, sourceLang, targetLang) {
  try {
    // Google uses our language codes directly (mostly)
    const sourceCode = sourceLang === 'nb' ? 'no' : sourceLang;
    const targetCode = targetLang === 'nb' ? 'no' : targetLang;

    const response = await axios.post(`${GOOGLE_API_URL}?key=${env.GOOGLE_TRANSLATE_API_KEY}`, {
      q: text,
      source: sourceCode,
      target: targetCode,
      format: 'text'
    });

    if (!response.data.data?.translations || response.data.data.translations.length === 0) {
      throw new Error('No translation returned from Google Translate API');
    }

    return response.data.data.translations[0].translatedText;
  } catch (err) {
    if (err.response) {
      const message = err.response.data?.error?.message || `Google Translate API error: ${err.response.status}`;
      throw new Error(message);
    } else if (err.request) {
      throw new Error('Google Translate API is not available');
    } else {
      throw new Error(`Google translation failed: ${err.message}`);
    }
  }
}

/**
 * Translate text using the specified service
 */
async function translateText(text, sourceLang, targetLang, service) {
  switch (service) {
    case 'deepl':
      return await translateWithDeepL(text, sourceLang, targetLang);
    case 'google':
      return await translateWithGoogle(text, sourceLang, targetLang);
    default:
      throw new Error(`Translation service ${service} not supported`);
  }
}

/**
 * Translate multiple lines of text
 */
async function translateMultipleLines(lines, sourceLang, targetLang, service) {
  try {
    // Join lines with a unique separator to preserve line boundaries
    const separator = '###LINE_BREAK###';
    const combinedText = lines.join(separator);
    
    // Translate the combined text
    const translatedText = await translateText(combinedText, sourceLang, targetLang, service);
    
    // Split back into individual lines
    const translatedLines = translatedText.split(separator);
    
    // Validate we got the same number of lines back
    if (translatedLines.length !== lines.length) {
      console.warn(`Line count mismatch: expected ${lines.length}, got ${translatedLines.length}`);
      // Try to handle gracefully by padding or truncating
      while (translatedLines.length < lines.length) {
        translatedLines.push('');
      }
      if (translatedLines.length > lines.length) {
        translatedLines.splice(lines.length);
      }
    }
    
    return translatedLines.map(line => line.trim());
  } catch (err) {
    console.error('Multi-line translation failed:', err);
    throw err;
  }
}

/**
 * Complete translation workflow: JSON -> extract -> translate -> rebuild
 */
async function translateJsonWorkflow(sourceJson, sourceLang, targetLang, service) {
  try {
    // Validate input JSON
    if (!isValidLocaleJson(sourceJson)) {
      throw new Error('Invalid locale JSON: only objects and strings are allowed');
    }

    // Extract strings
    const extractedStrings = extractStrings(sourceJson);
    if (extractedStrings.length === 0) {
      throw new Error('No translatable strings found in source JSON');
    }

    // Prepare text for translation (encoded placeholders)
    const sourceText = prepareTranslatorText(extractedStrings);
    const sourceLines = sourceText.split('\n').filter(line => line.trim() !== '');

    // Translate the lines
    const translatedLines = await translateMultipleLines(sourceLines, sourceLang, targetLang, service);

    // Rebuild JSON
    const mappedTranslations = mapTranslatedBack(extractedStrings, translatedLines);
    const translatedJson = expandKeyMapToJson(mappedTranslations);

    return {
      success: true,
      translatedJson,
      stringCount: extractedStrings.length,
      service: service.toUpperCase()
    };
  } catch (err) {
    throw err;
  }
}

/**
 * POST /api/translate
 * Translate locale JSON using DeepL or Google Translate
 */
export async function POST({ request }) {
  try {
    const { sourceJson, sourceLang, targetLang, service = 'deepl' } = await request.json();

    // Validate input
    if (!sourceJson) {
      throw error(400, { message: 'sourceJson is required' });
    }
    if (!sourceLang || !targetLang) {
      throw error(400, { message: 'sourceLang and targetLang are required' });
    }
    if (!['deepl', 'google'].includes(service)) {
      throw error(400, { message: 'service must be either "deepl" or "google"' });
    }

    // Validate environment and language support
    validateEnvironment(service);
    validateLanguageSupport(sourceLang, targetLang, service);

    // Perform translation
    const result = await translateJsonWorkflow(sourceJson, sourceLang, targetLang, service);

    return json({
      ...result,
      message: `Successfully translated ${result.stringCount} strings using ${result.service}`
    });

  } catch (err) {
    console.error('Translation API error:', err);
    
    if (err.status) {
      // Already a SvelteKit error
      throw err;
    }
    
    // Convert to SvelteKit error
    throw error(500, { message: err.message || 'Translation failed' });
  }
}

/**
 * GET /api/translate/health
 * Check translation service health
 */
export async function GET({ url }) {
  const service = url.searchParams.get('service') || 'deepl';
  
  try {
    validateEnvironment(service);
    
    // Test with a simple translation
    const testResult = await translateText('Hello', 'en', 'fr', service);
    
    return json({
      healthy: true,
      service: service.toUpperCase(),
      message: 'Service is operational'
    });
  } catch (err) {
    return json({
      healthy: false,
      service: service.toUpperCase(),
      error: err.message
    }, { status: 503 });
  }
}