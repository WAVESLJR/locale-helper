/**
 * Replace template placeholders like {name} with safe markers $@_1_@$
 * Returns { text: string, placeholders: Array<string> }
 */
export function encodePlaceholders(str) {
  const regex = /\{(.*?)\}/g;
  const placeholders = [];
  let idx = 1;
  const text = str.replace(regex, (_, p1) => {
    placeholders.push(p1);
    return `$@_${idx++}_@$`;
  });
  return { text, placeholders };
}

/**
 * Decode placeholders back to original {name} strings
 */
export function decodePlaceholders(str, placeholders) {
  let result = str;
  placeholders.forEach((p, i) => {
    const marker = `$@_${i + 1}_@$`;  // FIXED: Remove escaped backslashes
    result = result.replace(new RegExp(marker.replace(/\$/g, '\\$'), 'g'), `{${p}}`);
  });
  return result;
}

/**
 * Recursively extract all string values from JSON object
 * Returns an array of objects: { keyPath: 'key1.key2', value: string, placeholders: [] }
 */
export function extractStrings(obj, parentKey = '') {
  const result = [];
  
  if (!obj || typeof obj !== 'object') {
    return result;
  }

  const isObject = (val) =>
    val && typeof val === 'object' && !Array.isArray(val) && val !== null;

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }

    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    const value = obj[key];

    if (typeof value === 'string') {
      // Extract placeholders for this string
      const { text, placeholders } = encodePlaceholders(value);
      result.push({ 
        keyPath: fullKey, 
        value: value,           // Original string
        encodedValue: text,     // Encoded version  
        placeholders: placeholders 
      });
    } else if (isObject(value)) {
      result.push(...extractStrings(value, fullKey));
    }
  }

  return result;
}

/**
 * Convert array of string objects to encoded text for translator
 */
export function prepareTranslatorText(strings) {
  return strings.map((s) => s.encodedValue).join('\n');  // FIXED: Use pre-encoded value
}

/**
 * Enhanced mapTranslatedBack - handles all placeholder cases
 */
export function mapTranslatedBack(translatedText, extractedStrings) {
  // FIXED: Add validation
  if (!translatedText || typeof translatedText !== 'string') {
    throw new Error(`Invalid translatedText: expected string, got ${typeof translatedText}`);
  }
  
  const translatedLines = translatedText.trim().split('\n').map(line => line.trim());
  const result = {};
  
  if (translatedLines.length !== extractedStrings.length) {
    throw new Error(`Translation mismatch: Expected ${extractedStrings.length} lines, got ${translatedLines.length}`);
  }
  
  for (let i = 0; i < extractedStrings.length; i++) {
    const extracted = extractedStrings[i];
    const translatedValue = translatedLines[i];
    
    // Handle placeholders based on what the original had
    let finalValue;
    
    if (extracted.placeholders.length === 0) {
      // Case: No placeholders in original
      finalValue = translatedValue;
    } else {
      // Case: Had placeholders, decode them
      finalValue = decodePlaceholders(translatedValue, extracted.placeholders);
    }
    
    result[extracted.keyPath] = finalValue;
  }
    
  return result;
}


/**
 * Validate translations have correct placeholder count
 */
export function validateTranslations(strings, translatedLines) {
  if (strings.length !== translatedLines.length) {
    return { valid: false, error: 'Line count mismatch' };
  }
  for (let i = 0; i < strings.length; i++) {
    const origCount = strings[i].placeholders.length;
    const transCount = (translatedLines[i].match(/\$@_\d+_@\$/g) || []).length;
    if (origCount !== transCount) {
      return { valid: false, error: `Placeholder mismatch at line ${i + 1}. Expected ${origCount} placeholders, got ${transCount}` };
    }
  }
  return { valid: true };
}

/**
 * Expand flat key-value map back to nested JSON structure
 * Fixed to properly handle nested objects like options__1.label
 */
export function expandKeyMapToJson(translatedMap) {
  const result = {};
  
  // Sort keys by depth to ensure parent objects are created first
  const sortedKeys = Object.keys(translatedMap).sort((a, b) => {
    return a.split('.').length - b.split('.').length;
  });
  
  for (const keyPath of sortedKeys) {
    const value = translatedMap[keyPath];
    const parts = keyPath.split('.');
    
    let current = result;
    
    // Navigate to the correct position, creating objects as needed
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      
      // Create the object if it doesn't exist
      if (!current[part]) {
        current[part] = {};
      }
      
      current = current[part];
    }
    
    // Set the final value
    const finalKey = parts[parts.length - 1];
    current[finalKey] = value;
  }
  
  return result;
}