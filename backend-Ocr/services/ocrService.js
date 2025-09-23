// services/ocrService.js
// Pluggable OCR service: uses OCR_PROVIDER env var ('azure' or 'tesseract')
// - If OCR_PROVIDER=azure: uses Azure Computer Vision Read API (async) with polling + retries
// - If OCR_PROVIDER=tesseract: uses local tesseract.js worker
//
// Exports: initWorker(), recognize(imagePath), terminate(), getProvider()

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const OCR_PROVIDER = (process.env.OCR_PROVIDER || 'tesseract').toLowerCase();
const AZURE_KEY = process.env.AZURE_OCR_KEY || '';
const AZURE_ENDPOINT = process.env.AZURE_OCR_ENDPOINT || '';

/* ------------------ TESSERACT PART (fallback) ------------------ */
let tesseractWorker = null;
let tesseractInitialized = false;
async function initTesseract(lang = 'eng') {
  if (tesseractInitialized) return;
  const { createWorker } = require('tesseract.js');
  tesseractWorker = createWorker(); // Node-safe
  await tesseractWorker.load();
  await tesseractWorker.loadLanguage(lang);
  await tesseractWorker.initialize(lang);
  tesseractInitialized = true;
  console.log('ocrService: tesseract initialized');
}
async function recognizeTesseract(imagePath) {
  if (!tesseractInitialized) await initTesseract();
  const res = await tesseractWorker.recognize(imagePath);
  return res?.data?.text || '';
}
async function terminateTesseract() {
  if (tesseractWorker && tesseractInitialized) {
    try { await tesseractWorker.terminate(); } catch (e) { /* ignore */ }
    tesseractWorker = null;
    tesseractInitialized = false;
  }
}

/* ------------------ AZURE PART ------------------ */
/*
 Uses Azure Read API (vision/v3.2/read/analyze) pattern:
 1) POST image bytes to /vision/v3.2/read/analyze -> returns 202 and header "operation-location"
 2) Poll operation-location until status == "succeeded" or "failed"
 3) Read analyzeResult.readResults -> lines -> join into text
*/

async function recognizeAzure(imagePath, maxRetries = 3) {
  if (!AZURE_ENDPOINT || !AZURE_KEY) {
    throw new Error('Azure OCR not configured. Set AZURE_OCR_ENDPOINT and AZURE_OCR_KEY in .env');
  }

  const url = `${AZURE_ENDPOINT.replace(/\/$/, '')}/vision/v3.2/read/analyze?language=unk`;
  const imageBuffer = fs.readFileSync(imagePath);

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const postResp = await axios.post(url, imageBuffer, {
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_KEY,
          'Content-Type': 'application/octet-stream'
        },
        timeout: 20000,
        validateStatus: s => (s >= 200 && s < 300) || s === 202
      });

      // operation-location header contains URL to poll
      const operationLocation = postResp.headers['operation-location'] || postResp.headers['Operation-Location'];
      if (!operationLocation) {
        // fallback: some endpoints might return analyze result directly (rare). Try to parse body.
        if (postResp.data) {
          // try parse older OCR response
          const text = parseAzureOCRResponse(postResp.data);
          if (text) return text;
        }
        throw new Error('Azure OCR: missing operation-location header');
      }

      // Polling loop
      const pollHeaders = { 'Ocp-Apim-Subscription-Key': AZURE_KEY };
      const start = Date.now();
      const timeoutMs = 30000; // wait up to 30s
      while (true) {
        await delay(800); // small delay between polls
        const pollResp = await axios.get(operationLocation, { headers: pollHeaders, timeout: 20000 });
        const status = pollResp.data?.status || pollResp.data?.analyzeResult?.status;
        if (!status && pollResp.data?.analyzeResult) {
          // some variants put analyzeResult at top-level
          const text = parseAzureReadResult(pollResp.data.analyzeResult);
          return text;
        }
        if (status && status.toLowerCase() === 'succeeded') {
          // parse result
          const analyzeResult = pollResp.data?.analyzeResult || pollResp.data;
          const text = parseAzureReadResult(analyzeResult);
          return text;
        }
        if (status && status.toLowerCase() === 'failed') {
          throw new Error('Azure Read API failed (status=failed)');
        }
        if (Date.now() - start > timeoutMs) {
          throw new Error('Azure Read API timed out');
        }
      }

    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        // rate limited — wait a bit and retry outer loop
        console.warn(`ocrService: Azure rate-limited (attempt ${attempt+1}). Retrying...`);
        await delay(2000 * (attempt + 1));
        continue;
      }
      // other errors: if last attempt, raise
      if (attempt === maxRetries - 1) {
        console.error('ocrService: Azure OCR failed after retries:', err.message || err);
        throw err;
      }
      // else: small backoff
      await delay(1000 * (attempt + 1));
    }
  }

  throw new Error('ocrService: Azure OCR failed unexpectedly');
}

function parseAzureReadResult(analyzeResult) {
  // analyzeResult.readResults is an array of page objects with .lines
  const pages = analyzeResult?.readResults || analyzeResult?.pages || [];
  const lines = [];
  for (const page of pages) {
    const pageLines = page.lines || [];
    for (const ln of pageLines) {
      if (ln.text) lines.push(ln.text);
      else if (ln.words) lines.push(ln.words.map(w => w.text).join(' '));
    }
  }
  return lines.join('\n');
}

function parseAzureOCRResponse(data) {
  // fallback parsing for older OCR responses (regions -> lines -> words)
  if (!data) return '';
  if (data.regions) {
    const parts = [];
    for (const region of data.regions) {
      for (const line of region.lines || []) {
        const words = (line.words || []).map(w => w.text).join(' ');
        parts.push(words);
      }
    }
    return parts.join('\n');
  }
  return '';
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/* ------------------ PUBLIC API ------------------ */

async function initWorker() {
  if (OCR_PROVIDER === 'tesseract') {
    await initTesseract();
    return { ok: true, provider: 'tesseract' };
  }
  if (OCR_PROVIDER === 'azure') {
    // verify env config
    if (!AZURE_ENDPOINT || !AZURE_KEY) {
      throw new Error('ocrService init: azure provider selected but AZURE_OCR_ENDPOINT/AZURE_OCR_KEY missing');
    }
    console.log('ocrService: using Azure OCR provider');
    return { ok: true, provider: 'azure' };
  }
  throw new Error(`ocrService: unknown OCR_PROVIDER "${OCR_PROVIDER}"`);
}

async function recognize(imagePath) {
  if (OCR_PROVIDER === 'tesseract') {
    return await recognizeTesseract(imagePath);
  } else if (OCR_PROVIDER === 'azure') {
    return await recognizeAzure(imagePath);
  } else {
    throw new Error(`ocrService: unknown provider "${OCR_PROVIDER}"`);
  }
}

async function terminate() {
  if (OCR_PROVIDER === 'tesseract') await terminateTesseract();
  // azure: nothing to terminate
}

function getProvider() { return OCR_PROVIDER; }

module.exports = { initWorker, recognize, terminate, getProvider };
