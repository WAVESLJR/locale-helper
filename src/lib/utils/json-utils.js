// Normalize input string: add {} if missing
export const normalizeJson = (str) => {
  let trimmed = str.trim();
  if (!trimmed.startsWith('{')) trimmed = '{' + trimmed;
  if (!trimmed.endsWith('}')) trimmed = trimmed + '}';
  return trimmed;
};

// Recursively validate locale JSON:
// Must be object -> { key: string | nested object }
// No arrays, numbers, booleans, null, etc.
export const isValidLocaleJson = (obj) => {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return false;
  }

  return Object.values(obj).every((val) => {
    if (typeof val === 'string') return true;
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      return isValidLocaleJson(val); // recursive check
    }
    return false;
  });
};

/**
 * Prettify a JSON string or object
 * @param {string | object} data
 * @param {number} spaces - number of spaces for indentation
 * @returns {string} - pretty-printed JSON
 */
export const prettifyJson = (data, spaces = 2) => {
  let obj;
  if (typeof data === 'string') {
    try {
      obj = JSON.parse(data);
    } catch (err) {
      console.error('Invalid JSON string:', err);
      return data; // fallback: return original
    }
  } else if (typeof data === 'object' && data !== null) {
    obj = data;
  } else {
    return String(data);
  }

  return JSON.stringify(obj, null, spaces);
};

