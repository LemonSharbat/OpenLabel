const fs = require("fs");
const { AzureKeyCredential, DocumentAnalysisClient } = require("@azure/ai-form-recognizer");

const endpoint = process.env.DOC_ENDPOINT;
const apiKey = process.env.DOC_KEY;

if (!endpoint || !apiKey) {
  console.error("❌ Missing Azure credentials. Check .env file.");
  process.exit(1);
}

const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apiKey));

async function extractTextFromImage(filePath) {
  try {
    const fileStream = fs.createReadStream(filePath);
    const poller = await client.beginAnalyzeDocument("prebuilt-read", fileStream);
    const { content } = await poller.pollUntilDone();
    return content;
  } catch (err) {
    console.error("❌ Azure OCR failed:", err.message || err);
    return "";
  }
}

module.exports = { extractTextFromImage };
