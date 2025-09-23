const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { extractTextFromImage } = require("../services/azureOcrService");
const { callLLM } = require("../rag/llm");

const router = express.Router();

// Multer setup
const UPLOAD_DIR = "uploads";
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Scan product route
router.post("/scan-product", upload.single("productImage"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const imagePath = req.file.path;

    // OCR
    const text = await extractTextFromImage(imagePath);

    // Guess product name (first line)
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const productNameGuess = lines.length > 0 ? lines[0] : "Unknown";

    // Call OpenRouter LLM
    const llmPrompt = `You are an expert in food products. I have a product named "${productNameGuess}". 
Does this product exist? If yes, give a short description and main category. 
If unknown, say "Product not found".`;

    const llmResult = await callLLM({ userPrompt: llmPrompt });

    // Clean up image
    fs.unlink(imagePath, () => {});

    res.json({
      extractedText: text,
      guessedProductName: productNameGuess,
      llmCheck: llmResult
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Product scan failed" });
  }
});

module.exports = router;
