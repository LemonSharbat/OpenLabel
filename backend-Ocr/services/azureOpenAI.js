// services/azureOpenAI.js
const { AzureOpenAI } = require("openai");
require("dotenv").config();

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_KEY;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT; // your deployment name

if (!endpoint || !apiKey || !deployment) {
  console.warn("❌ Missing Azure OpenAI credentials or deployment in .env");
}

const client = new AzureOpenAI({
  endpoint: endpoint,
  apiKey: apiKey,
  apiVersion: "2024-05-01-preview", // Latest stable API version
  deployment: deployment
});

async function askAzureChat(prompt, options = {}) {
  const maxTokens = options.maxTokens ?? 300;
  const temperature = options.temperature ?? 0.2;

  try {
    const result = await client.chat.completions.create({
      messages: [
        { role: "system", content: "You are a friendly personal health guide." },
        { role: "user", content: prompt }
      ],
      max_tokens: maxTokens,
      temperature: temperature,
      model: deployment // Use deployment name as model
    });

    const choice = result.choices?.[0];
    const content = choice?.message?.content ?? "";
    return content;
  } catch (err) {
    console.error("Azure OpenAI ask error:", err?.message || err);
    throw err;
  }
}

module.exports = { askAzureChat };