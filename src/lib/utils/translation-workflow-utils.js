// translation-workflow-utils.js
export function validateJsonInput(jsonString) {
  if (!jsonString.trim()) {
    throw new Error('Please enter some JSON to process');
  }
  
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (parseError) {
    const fixed = fixJsonIssues(jsonString);
    try {
      parsed = JSON.parse(fixed);
      return { json: parsed, wasFixed: true };
    } catch (fixedError) {
      throw new Error(`Invalid JSON: ${parseError.message}`);
    }
  }
  
  if (!isValidLocaleJson(parsed)) {
    throw new Error('Invalid locale JSON: Only objects and strings are allowed');
  }
  
  return { json: parsed, wasFixed: false };
}

export function processExtractedStrings(jsonObject) {
  const extractedStrings = extractStrings(jsonObject);
  if (extractedStrings.length === 0) {
    throw new Error('No translatable strings found in the JSON');
  }
  const sourceText = prepareTranslatorText(extractedStrings);
  return { extractedStrings, sourceText };
}