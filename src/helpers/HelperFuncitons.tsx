// Currency formatting function (unchanged, but ensured it works with raw numeric strings)


// Format numeric values for display (percentages) - unchanged
export const formatPercentage = (value: string) => {
  if (!value) return '';
  const numericValue = value.replace(/[^0-9.]/g, '');
  if (!numericValue) return value;
  
  const num = parseFloat(numericValue);
  if (isNaN(num)) return value;
  
  // Format as percentage with 2 decimal places
  return num.toFixed(2) + '%';
};

// Clean numeric input (remove commas, percentages, etc.) - unchanged, but now used in onChange
export const cleanNumericInput = (text: string, isCurrency: boolean = false) => {
  // Remove currency symbols, commas, and percentage signs
  let cleaned = text.replace(/[$,%]/g, '');
  // Keep only numbers and decimal point
  cleaned = cleaned.replace(/[^0-9.]/g, '');
  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  return cleaned;
};



// Helper function to parse JSON array strings from API
export const parseMortgageArray = (value: any): string[] => {
  if (!value || value === null || value === '[]') {
    return [];
  }
  let array: string[];
  if (typeof value === 'string') {
    // Clean escaped quotes (e.g., "[\"fixed\"]" -> '["fixed"]')
    const cleaned = value.replace(/\\"/g, '"');
    try {
      array = JSON.parse(cleaned);
      // Ensure all items are strings (API mixes numbers/strings)
      return array.map((item: any) => String(item));
    } catch (error) {
      console.warn('Failed to parse mortgage array:', value, error);
      // Fallback: if simple "[val]", extract as single-item array
      if (value.startsWith('[') && value.endsWith(']')) {
        const inner = value.slice(1, -1).trim();
        if (inner) {
          return [String(inner)];
        }
      }
      return [];
    }
  }
  // If already an array, map to strings
  return Array.isArray(value) ? value.map(String) : [];
};



// 1. Convert API response into transposed array
export function createTransposedArray(obj: { [key: string]: any }) {
  const transposedArray: any[] = [];

  // Get keys
  const keys = Object.keys(obj);

  // Convert fields (parse JSON if needed)
  const arrays = keys.map(key => {
    try {
      if (typeof obj[key] !== "string") {
        return obj[key] || [];
      } else {
        return JSON.parse(obj[key]);
      }
    } catch {
      return []; 
    }
  });

  // Find longest array length
  const maxLength = Math.max(...arrays.map(arr => arr.length));

  // Build rows
  for (let i = 0; i < maxLength; i++) {
    const row: { [key: string]: any } = {};
    keys.forEach((key, index) => {
      const value = arrays[index][i];
      row[key] = value !== null && value !== undefined ? value : "";
    });
    transposedArray.push(row);
  }

  return transposedArray;
}

// 2. Convert transposed array back into API response format
export function createResponseObject(transposedArray: any[]): { [key: string]: any } {
  const responseObj: { [key: string]: any } = {};

  if (!transposedArray.length) return responseObj;

  // Collect keys
  const keys = Object.keys(transposedArray[0]);

  keys.forEach(key => {
    const columnValues = transposedArray.map(row => row[key]);
    responseObj[key] = JSON.stringify(columnValues);
  });

  return responseObj;
}


export const formatCurrency = (value: string | number) => {
  if (!value) return '';
  const number = Number(value);
  if (isNaN(number)) return '';
  return `$${number.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};


