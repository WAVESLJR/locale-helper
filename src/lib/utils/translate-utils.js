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
    const marker = `$@_${i + 1}_@$`;
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

  const isObject = (val) =>
    val && typeof val === 'object' && !Array.isArray(val);

  for (const key in obj) {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    const value = obj[key];

    if (typeof value === 'string') {
      const { text, placeholders } = encodePlaceholders(value);
      result.push({ keyPath: fullKey, value: text, placeholders });
    } else if (isObject(value)) {
      result.push(...extractStrings(value, fullKey));
    } else {
      // ignore arrays or other types
    }
  }

  return result;
}

/**
 * Convert array of string objects to a single text for translator
 */
export function prepareTranslatorText(strings) {
  return strings.map((s) => s.value).join('\n');
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
