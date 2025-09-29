// Normalize input string: add {} if missing
export const normalizeJson = (str) => {
  let trimmed = str.trim();
  if (!trimmed.startsWith('{')) trimmed = '{' + trimmed;
  if (!trimmed.endsWith('}')) trimmed = trimmed + '}';
  return trimmed;
};

// Fix common JSON issues for locale files
export const fixJsonIssues = (jsonStr) => {
  let fixed = jsonStr.trim();

  // Remove trailing commas at the very end
  fixed = fixed.replace(/,\s*$/, '');
  
  // Remove trailing commas before closing braces (this was missing!)
  fixed = fixed.replace(/,(\s*})/g, '$1');
  
  // Remove trailing commas before closing brackets  
  fixed = fixed.replace(/,(\s*])/g, '$1');
  
  // Try to add outer braces if it looks like object content
  if (!fixed.startsWith('{')) {
    // Check if it looks like object properties (has colons and quotes)
    if (fixed.includes(':') && fixed.includes('"')) {
      // Add outer braces for partial objects
      fixed = `{${fixed}}`;
    }
  }
  
  return fixed;
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

// Parse and validate JSON string for locale files
// Returns { success: boolean, data?: object, error?: string }
export const parseLocaleJson = (jsonStr) => {
  try {
    const parsed = JSON.parse(jsonStr);
    if (isValidLocaleJson(parsed)) {
      return { success: true, data: parsed };
    } else {
      return { success: false, error: 'JSON contains invalid types for locale file (only objects and strings allowed)' };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// Try to parse JSON with automatic fixing for common issues
export const parseJsonWithFixes = (jsonStr) => {
  // First try parsing as-is
  try {
    const parsed = JSON.parse(jsonStr);
    return { success: true, data: parsed, fixed: false };
  } catch (_) {
    // If that fails, try to fix common issues
    try {
      const fixed = fixJsonIssues(jsonStr);
      const parsed = JSON.parse(fixed);
      return { success: true, data: parsed, fixed: true, fixedJson: fixed };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
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

// Validate and format JSON specifically for locale files
export const validateAndFormatLocaleJson = (jsonStr, spaces = 2) => {
  const parseResult = parseJsonWithFixes(jsonStr.trim());
  
  if (!parseResult.success) {
    return { success: false, error: parseResult.error };
  }
  
  if (!isValidLocaleJson(parseResult.data)) {
    return { success: false, error: 'JSON contains invalid types for locale file (only objects and strings allowed)' };
  }
  
  const formatted = prettifyJson(parseResult.data, spaces);
  return { 
    success: true, 
    formatted,
    wasFixed: parseResult.fixed || false,
    originalFixed: parseResult.fixedJson
  };
};


/**
 * Convert complete JSON object to partial JSON (removes outer braces)
 * Only works if input is a valid JSON object
 */
export function makePartialJson(jsonStr) {
  if (!jsonStr || typeof jsonStr !== 'string') {
    return jsonStr;
  }
  
  const trimmed = jsonStr.trim();
  
  try {
    // Check if it's valid JSON
    const parsed = JSON.parse(trimmed);
    
    // Check if it's an object (not array, string, number, etc.)
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      // Remove outer braces and add trailing comma
      const content = trimmed.slice(1, -1).trimEnd();
      return content + ',';
    }
    
    // Not an object, return as-is
    return jsonStr;
    
  } catch (error) {
    // Invalid JSON, return as-is
    return jsonStr;
  }
}