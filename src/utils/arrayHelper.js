/**
 * Safely parses and flattens array fields that might be stringified, double-stringified,
 * or nested string representations of JSON arrays (e.g. from FormData submissions).
 * 
 * @param {any} fieldData - The raw field data to parse.
 * @returns {string[]} An array of cleaned string values.
 */
export const parseArrayField = (fieldData) => {
  if (!fieldData) return [];
  
  let result = [];
  if (Array.isArray(fieldData)) {
    result = fieldData;
  } else if (typeof fieldData === 'string') {
    try {
      const parsed = JSON.parse(fieldData);
      if (Array.isArray(parsed)) {
        result = parsed;
      } else {
        result = [parsed];
      }
    } catch {
      // Split by comma if it's a simple string representation
      result = fieldData.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  // Flatten and recursively parse stringified JSON arrays inside the array
  const cleanResult = [];
  const processItem = (item) => {
    if (typeof item === 'string') {
      const trimmed = item.trim();
      if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('"[') && trimmed.endsWith(']"'))) {
        try {
          // Normalize double quoted JSON strings if needed
          let normalized = trimmed;
          if (normalized.startsWith('"') && normalized.endsWith('"')) {
            normalized = JSON.parse(normalized);
          }
          const parsed = JSON.parse(normalized);
          if (Array.isArray(parsed)) {
            parsed.forEach(processItem);
          } else {
            cleanResult.push(parsed);
          }
        } catch {
          cleanResult.push(item);
        }
      } else {
        // Strip out enclosing quotes if any
        let cleanStr = item;
        if (cleanStr.startsWith('"') && cleanStr.endsWith('"')) {
          try {
            cleanStr = JSON.parse(cleanStr);
          } catch {
            // If parsing fails, fall back to keeping the raw string
          }
        }
        cleanResult.push(cleanStr);
      }
    } else {
      cleanResult.push(item);
    }
  };

  result.forEach(processItem);
  return cleanResult.map(item => String(item).trim()).filter(Boolean);
};
