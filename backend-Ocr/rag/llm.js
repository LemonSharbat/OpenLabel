const axios = require("axios");
const fs = require("fs");
const path = require("path");

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const DAILY_LIMIT = parseInt(process.env.DAILY_LIMIT || "50", 10);
const USAGE_FILE = path.join(__dirname, "..", "usage.json");

function readUsage() {
  try {
    return JSON.parse(fs.readFileSync(USAGE_FILE, "utf-8"));
  } catch {
    const today = new Date().toDateString();
    const obj = { date: today, count: 0 };
    fs.writeFileSync(USAGE_FILE, JSON.stringify(obj));
    return obj;
  }
}

function writeUsage(u) { fs.writeFileSync(USAGE_FILE, JSON.stringify(u)); }

function canMakeRequest() {
  const usage = readUsage();
  const today = new Date().toDateString();
  if (usage.date !== today) {
    usage.date = today;
    usage.count = 0;
    writeUsage(usage);
  }
  return usage.count < DAILY_LIMIT;
}

function incrementUsage() {
  const usage = readUsage();
  usage.count = (usage.count || 0) + 1;
  writeUsage(usage);
}

async function callLLM({ systemPrompt = "You are a helpful nutrition assistant.", userPrompt = "", model = "gpt-3.5-turbo:free", maxRetries = 3, delayMs = 4000 }) {
  if (!canMakeRequest()) throw new Error("Daily free request limit reached");
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const resp = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 512
        },
        { headers: { Authorization: `Bearer ${OPENROUTER_KEY}`, "Content-Type": "application/json" }, timeout: 120000 }
      );
      incrementUsage();
      return resp.data.choices?.[0]?.message?.content ?? "";
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        console.log(`LLM rate-limited, attempt ${attempt + 1}/${maxRetries}. Retrying in ${delayMs/1000}s...`);
        await new Promise(r => setTimeout(r, delayMs));
      } else {
        throw new Error(`LLM call failed: ${JSON.stringify(err.response?.data || err.message)}`);
      }
    }
  }
  throw new Error("LLM failed after retries due to rate limits");
}

module.exports = { callLLM, canMakeRequest, readUsage };
