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
    const marker = `\\$@_${i + 1}_@\\$`;  // Escape the $ characters
    result = result.replace(new RegExp(marker, 'g'), `{${p}}`);
  });
  return result;
}

/**
 * Recursively extract all string values from JSON object
 * Returns an array of objects: { keyPath: 'key1.key2', value: string, placeholders: [] }
 */
export function extractStrings(obj, parentKey = '') {
  const result = [];
  
  // Input validation
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
      const { text, placeholders } = encodePlaceholders(value);
      // Store original value and placeholders separately
      result.push({ keyPath: fullKey, value: value, placeholders });
    } else if (Array.isArray(value)) {
      for (let index = 0; index < value.length; index++) {
        const item = value[index];
        const arrayKey = `${fullKey}[${index}]`;
        if (typeof item === 'string') {
          const { text, placeholders } = encodePlaceholders(item);
          result.push({ keyPath: arrayKey, value: item, placeholders });
        } else if (isObject(item)) {
          result.push(...extractStrings(item, arrayKey));
        }
      }
    } else if (isObject(value)) {
      if (Object.keys(value).length === 1 && value.hasOwnProperty('label') && typeof value.label === 'string') {
        const { text, placeholders } = encodePlaceholders(value.label);
        result.push({ keyPath: fullKey, value: value.label, placeholders });
      } else {
        result.push(...extractStrings(value, fullKey));
      }
    }
  }

  return result;
}

/**
 * Convert array of string objects to encoded text for translator
 * This is the key fix - encode the placeholders for translation
 */
export function prepareTranslatorText(strings) {
  return strings.map((s) => {
    const { text } = encodePlaceholders(s.value);
    return text;
  }).join('\n');
}

/**
 * Map translated lines back to the original JSON keys
 */
export function mapTranslatedBack(strings, translatedLines) {
  const output = {};
  strings.forEach((s, idx) => {
    const translated = decodePlaceholders(translatedLines[idx], s.placeholders);
    output[s.keyPath] = translated;
  });
  return output;
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
 */
export function expandKeyMapToJson(map) {
  const result = {};
  for (const keyPath in map) {
    const parts = keyPath.split('.');
    let current = result;
    
    parts.forEach((part, idx) => {
      // Handle array notation like "items[0]"
      if (part.includes('[') && part.includes(']')) {
        const [arrayKey, indexStr] = part.split('[');
        const index = parseInt(indexStr.replace(']', ''));
        
        if (!current[arrayKey]) {
          current[arrayKey] = [];
        }
        
        if (idx === parts.length - 1) {
          current[arrayKey][index] = map[keyPath];
        } else {
          if (!current[arrayKey][index]) {
            current[arrayKey][index] = {};
          }
          current = current[arrayKey][index];
        }
      } else {
        if (idx === parts.length - 1) {
          current[part] = map[keyPath];
        } else {
          current[part] = current[part] || {};
          current = current[part];
        }
      }
    });
  }
  return result;
}