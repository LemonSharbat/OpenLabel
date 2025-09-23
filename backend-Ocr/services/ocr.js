// services/ocr.js
// Provides initOCR(), extractText(filePath), terminateOCR()
// Uses Tesseract.js by default. Swappable later by changing OCR_PROVIDER env var.

const { createWorker } = require('tesseract.js');
const Jimp = require('jimp');
const path = require('path');
const os = require('os');
const fs = require('fs');

const OCR_PROVIDER = (process.env.OCR_PROVIDER || 'tesseract').toLowerCase();

let worker = null;
let workerInitialized = false;

async function initTesseract() {
  if (workerInitialized) return;
  worker = createWorker({
    logger: (m) => { /* optional logging: console.log(m) */ },
  });
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  workerInitialized = true;
}

async function preprocessImage(filePath) {
  // lightweight preprocessing: grayscale, normalize, increase contrast, scale to readable height
  const tmp = path.join(os.tmpdir(), `ol_preproc_${Date.now()}.png`);
  const image = await Jimp.read(filePath);
  image
    .greyscale()
    .contrast(0.6)
    .normalize()
    // keep width auto, set height to 1600 (good for labels), preserving aspect ratio
    .resize(Jimp.AUTO, 1600);
  await image.writeAsync(tmp);
  return tmp;
}

async function extractTextTesseract(filePath) {
  await initTesseract();
  const pre = await preprocessImage(filePath);
  const { data } = await worker.recognize(pre);
  try { if (pre !== filePath) fs.unlinkSync(pre); } catch {}
  // data.text contains the raw OCR text
  return data.text || '';
}

// Placeholder for future Azure implementation
async function extractTextAzure(filePath) {
  throw new Error('Azure OCR not implemented in services/ocr.js yet. Replace this function to use Azure OCR.');
}

// Public API
async function initOCR() {
  if (OCR_PROVIDER === 'tesseract') {
    await initTesseract();
  } else {
    // if azure or other provider chosen — user should implement
    // For now, we still return since default is tesseract
    // Optionally initialize Azure client here when implemented
  }
}

async function extractText(filePath) {
  if (OCR_PROVIDER === 'tesseract') {
    return await extractTextTesseract(filePath);
  } else if (OCR_PROVIDER === 'azure') {
    return await extractTextAzure(filePath);
  } else {
    throw new Error(`Unknown OCR_PROVIDER: ${OCR_PROVIDER}`);
  }
}

async function terminateOCR() {
  if (worker && workerInitialized) {
    try {
      await worker.terminate();
    } catch (e) {}
    worker = null;
    workerInitialized = false;
  }
}

module.exports = { initOCR, extractText, terminateOCR, OCR_PROVIDER };
