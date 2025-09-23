// services/nutritionParser.js
const fs = require('fs');
const path = require('path');
const SCHEMA = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'nutritionSchema.json'), 'utf-8'));

// Utility: try to extract number+unit from a line using regex
function findNumber(line) {
  // matches numbers like 220, 220.5, 12 g, 200 mg, 0.5g
  const m = line.match(/([0-9]+(?:\.[0-9]+)?)\s*(k?cal|kj|mg|g|mcg)?/i);
  if (!m) return null;
  return { value: m[1], unit: (m[2] || '').trim() };
}

function parseNutrition(rawText) {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const lowerLines = lines.map(l => l.toLowerCase());

  const nutrients = {};
  for (const nutrient of SCHEMA.nutrients) {
    nutrients[nutrient] = null;
  }

  // Parse line by line
  for (let i = 0; i < lowerLines.length; i++) {
    const line = lowerLines[i];
    const originalLine = lines[i];

    // Ingredients
    if (/^ingredients[:\-]/i.test(originalLine) || /^ingredients[:\-]/i.test(line)) {
      const after = originalLine.split(/ingredients[:\-]/i)[1] || '';
      nutrients.ingredients = after.trim() || null;
      continue;
    }
    if (!nutrients.ingredients && /(^contains|^contains:)/i.test(line)) {
      nutrients.ingredients = originalLine.replace(/(^contains:?\s*)/i, '').trim();
    }

    // Try matching the schema aliases
    for (const [key, aliases] of Object.entries(SCHEMA.commonAliases)) {
      for (const alias of aliases) {
        if (line.includes(alias)) {
          // try to find number in the same line
          const num = findNumber(line);
          if (num) {
            nutrients[key] = `${num.value}${num.unit ? ' ' + num.unit : ''}`.trim();
          } else {
            // case: "of which sugars 12g" or next token contains number
            const m2 = originalLine.match(/([0-9]+(?:\.[0-9]+)?)(?:\s*(g|mg|k?cal|kj|mcg))?/i);
            if (m2) nutrients[key] = `${m2[1]}${m2[2] ? ' ' + m2[2] : ''}`;
          }
        }
      }
    }
  }

  // fallback: sometimes lines like "SUGAR 12g\nFAT 10g" with no labels mapping; try a catch-all line pattern
  // (this is intentionally conservative to avoid false matches)

  return { raw: rawText, lines, nutrients, ingredients: nutrients.ingredients || null };
}

function pruneNonZero(parsed) {
  const out = {};
  for (const [k, v] of Object.entries(parsed.nutrients)) {
    if (!v) continue;
    // try numeric check
    const n = parseFloat(v);
    if (!isNaN(n) && n <= 0) continue;
    out[k] = v;
  }
  if (parsed.ingredients) out.ingredients = parsed.ingredients;
  return out;
}

module.exports = { parseNutrition, pruneNonZero };
