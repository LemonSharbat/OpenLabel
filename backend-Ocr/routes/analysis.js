const express = require("express");
const multer = require("multer");
const https = require("https"); // ✅ Built-in Node.js module
const http = require("http"); // ✅ Built-in Node.js module
const { v2: cloudinary } = require("cloudinary");
const router = express.Router();

// Keep existing Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Keep existing multer config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// ✅ HTTP request helper using built-in modules
const makeRequest = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === "https:";
    const httpModule = isHttps ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || "GET",
      headers: options.headers || {},
    };

    const req = httpModule.request(requestOptions, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          json: () => {
            try {
              return JSON.parse(data);
            } catch (e) {
              return data;
            }
          },
        });
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
};

// ✅ Document Intelligence using built-in Node.js modules
router.post("/analyze-image", upload.single("image"), async (req, res) => {
  try {
    console.log("📤 Analysis request received");

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided. Use "image" as field name.',
      });
    }

    console.log(
      "📸 Image received:",
      req.file.originalname,
      `(${(req.file.size / 1024).toFixed(1)} KB)`
    );

    // Check credentials
    const azureKey = process.env.DOC_KEY;
    const azureEndpoint = process.env.DOC_ENDPOINT;

    if (!azureKey || !azureEndpoint) {
      return res.status(400).json({
        success: false,
        message:
          "Missing Azure credentials. Add DOC_KEY and DOC_ENDPOINT to .env",
      });
    }

    // Upload to Cloudinary (keep existing)
    console.log("☁️ Uploading to Cloudinary...");
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "ingredient-analysis",
          transformation: [
            { quality: "auto:good" },
            { fetch_format: "auto" },
            { width: 1000, height: 1000, crop: "limit" },
          ],
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const uploadResult = await uploadPromise;
    const imageUrl = uploadResult.secure_url;
    console.log("✅ Image uploaded:", imageUrl);

    // ✅ Document Intelligence using built-in HTTP modules
    console.log("🔍 Processing with Azure Document Intelligence...");

    // Step 1: Start document analysis
    const analyzeUrl = `${azureEndpoint}/formrecognizer/documentModels/prebuilt-read:analyze?api-version=2023-07-31`;

    const analyzeResponse = await makeRequest(analyzeUrl, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": azureKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        urlSource: imageUrl,
      }),
    });

    if (analyzeResponse.status !== 202) {
      const errorData = analyzeResponse.json();
      throw new Error(
        `Document Intelligence API error: ${
          analyzeResponse.status
        } - ${JSON.stringify(errorData)}`
      );
    }

    // Get operation location from response headers
    const operationLocation = analyzeResponse.headers["operation-location"];
    if (!operationLocation) {
      throw new Error("No operation-location header in response");
    }

    console.log("⏳ Waiting for Document Intelligence processing...");

    // Step 2: Poll for results
    let result;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

      const resultResponse = await makeRequest(operationLocation, {
        method: "GET",
        headers: {
          "Ocp-Apim-Subscription-Key": azureKey,
        },
      });

      if (resultResponse.status !== 200) {
        throw new Error(`Failed to get results: ${resultResponse.status}`);
      }

      result = resultResponse.json();
      console.log(
        `📊 Analysis status: ${result.status} (attempt ${attempts + 1})`
      );

      if (result.status === "succeeded") {
        break;
      } else if (result.status === "failed") {
        throw new Error(
          `Document analysis failed: ${
            result.error?.message || "Unknown error"
          }`
        );
      }

      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error("Document analysis timed out");
    }

    // Extract text from results
    let extractedText = "";
    if (result.analyzeResult && result.analyzeResult.content) {
      extractedText = result.analyzeResult.content;
    }

    console.log("✅ Document Intelligence processing complete!");
    console.log("📝 Extracted text:", extractedText.substring(0, 200) + "...");

    // Ingredient analysis (keep existing logic)
    const possibleIngredients = extractedText
      .toLowerCase()
      .replace(/ingredients?:?/i, "")
      .split(/[,;:\n]/)
      .map((item) => item.trim())
      .filter(
        (item) => item.length > 2 && item.length < 50 && !/^\d+$/.test(item)
      )
      .slice(0, 20);

    const analysisResults = possibleIngredients.map((ingredient) => {
      let healthScore = 0;
      let warnings = [];

      if (ingredient.includes("sugar") || ingredient.includes("syrup")) {
        healthScore = -2;
        warnings.push("High sugar content");
      }
      if (ingredient.includes("sodium") || ingredient.includes("salt")) {
        healthScore = -1;
        warnings.push("High sodium");
      }
      if (ingredient.includes("vitamin") || ingredient.includes("protein")) {
        healthScore = 2;
      }

      return {
        name: ingredient,
        healthScore,
        warnings,
        category: "unknown",
      };
    });

    const overallScore =
      analysisResults.length > 0
        ? analysisResults.reduce((acc, curr) => acc + curr.healthScore, 0) /
          analysisResults.length
        : 0;

    console.log("✅ Full analysis complete!");

    res.status(200).json({
      success: true,
      message: "Image analyzed successfully with Document Intelligence! 🎉",
      data: {
        imageUrl,
        extractedText: extractedText.trim(),
        possibleIngredients,
        analysisResults,
        overallScore: parseFloat(overallScore.toFixed(1)),
        totalIngredients: possibleIngredients.length,
        cloudinaryInfo: {
          public_id: uploadResult.public_id,
          width: uploadResult.width,
          height: uploadResult.height,
        },
      },
    });
  } catch (error) {
    console.error("❌ Analysis Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to analyze image",
      error: error.message,
      details: error.stack,
    });
  }
});

// Keep existing health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Analysis service is running with built-in modules",
    hasAzureKeys: !!(process.env.DOC_KEY && process.env.DOC_ENDPOINT),
    hasCloudinary: !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ),
  });
});

module.exports = router;
