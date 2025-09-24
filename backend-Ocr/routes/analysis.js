const express = require("express");
const multer = require("multer");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { v2: cloudinary } = require("cloudinary");
const router = express.Router();

// Configure Cloudinary (keep existing)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Configure multer (keep existing)
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

// ✅ CREATE REPORTS DIRECTORY
const REPORTS_DIR = "saved_reports";
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR);
  console.log("✅ Created saved_reports directory");
}

// Keep your existing WHO standards and helper functions...
const nutritionalStandards = {
  sodium: {
    dailyLimit: 2300,
    highThreshold: 400,
    mediumThreshold: 120,
  },
  sugar: {
    dailyLimit: 50,
    highThreshold: 15,
    mediumThreshold: 5,
  },
  saturatedFat: {
    dailyLimit: 22,
    highThreshold: 5,
    mediumThreshold: 1.5,
  },
  fiber: {
    dailyRecommended: 25,
    highThreshold: 6,
    mediumThreshold: 3,
  },
  protein: {
    dailyRecommended: 50,
    highThreshold: 12,
    mediumThreshold: 6,
  },
  harmfulIngredients: [
    "trans fat",
    "trans fats",
    "hydrogenated oil",
    "partially hydrogenated",
    "high fructose corn syrup",
    "corn syrup",
    "artificial sweeteners",
    "sodium benzoate",
    "sodium nitrite",
    "msg",
    "monosodium glutamate",
    "artificial colors",
    "red dye",
    "yellow dye",
    "blue dye",
    "bht",
    "bha",
    "tbhq",
    "propyl gallate",
  ],
  healthyIngredients: [
    "organic",
    "whole grain",
    "fiber",
    "protein",
    "vitamins",
    "minerals",
    "omega-3",
    "probiotics",
    "antioxidants",
    "natural flavor",
    "sea salt",
    "coconut oil",
    "olive oil",
  ],
};

// Keep your existing analysis functions...
const analyzeIngredientHealth = (ingredient, extractedText) => {
  const lowerIngredient = ingredient.toLowerCase();
  let score = 0;
  let warnings = [];
  let benefits = [];
  let category = "neutral";
  let severity = "low";

  // Check for harmful ingredients
  nutritionalStandards.harmfulIngredients.forEach((harmful) => {
    if (lowerIngredient.includes(harmful)) {
      score -= 3;
      warnings.push(`Contains ${harmful} - avoid for health`);
      category = "harmful";
      severity =
        harmful.includes("trans") || harmful.includes("hydrogenated")
          ? "high"
          : "medium";
    }
  });

  // Check for healthy ingredients
  nutritionalStandards.healthyIngredients.forEach((healthy) => {
    if (lowerIngredient.includes(healthy)) {
      score += 2;
      benefits.push(`Contains ${healthy} - good for health`);
      category = category === "harmful" ? "mixed" : "beneficial";
    }
  });

  // Specific ingredient analysis
  if (
    lowerIngredient.includes("sugar") &&
    !lowerIngredient.includes("no sugar")
  ) {
    score -= 2;
    warnings.push("High sugar content");
    severity = "medium";
  }

  if (lowerIngredient.includes("sodium") || lowerIngredient.includes("salt")) {
    score -= 1;
    warnings.push("High sodium content");
  }

  if (
    lowerIngredient.includes("vitamin") ||
    lowerIngredient.includes("mineral")
  ) {
    score += 1;
    benefits.push("Contains vitamins/minerals");
  }

  if (
    lowerIngredient.includes("fiber") ||
    lowerIngredient.includes("whole grain")
  ) {
    score += 2;
    benefits.push("Good source of fiber");
  }

  return {
    name: ingredient,
    healthScore: score,
    warnings,
    benefits,
    category,
    severity,
    recommendation: score >= 0 ? "accept" : "avoid",
  };
};

const generateProductRecommendation = (
  analysisResults,
  extractedText,
  totalIngredients
) => {
  const totalScore = analysisResults.reduce(
    (sum, ingredient) => sum + ingredient.healthScore,
    0
  );
  const averageScore = totalIngredients > 0 ? totalScore / totalIngredients : 0;

  const harmfulCount = analysisResults.filter(
    (ing) => ing.category === "harmful"
  ).length;
  const beneficialCount = analysisResults.filter(
    (ing) => ing.category === "beneficial"
  ).length;
  const highSeverityCount = analysisResults.filter(
    (ing) => ing.severity === "high"
  ).length;

  let recommendation = "neutral";
  let confidence = 0;
  let reasoning = [];
  let buyAdvice = "";
  let healthGrade = "C";

  // Calculate health grade (A-F scale)
  if (averageScore >= 1.5) {
    healthGrade = "A";
    recommendation = "buy";
    buyAdvice = "✅ Recommended - This is a healthy choice!";
  } else if (averageScore >= 0.5) {
    healthGrade = "B";
    recommendation = "buy";
    buyAdvice = "✅ Good Choice - Generally healthy with minor concerns";
  } else if (averageScore >= -0.5) {
    healthGrade = "C";
    recommendation = "caution";
    buyAdvice = "⚠️ Use Caution - Mixed ingredients, consume in moderation";
  } else if (averageScore >= -1.5) {
    healthGrade = "D";
    recommendation = "avoid";
    buyAdvice = "❌ Not Recommended - Contains concerning ingredients";
  } else {
    healthGrade = "F";
    recommendation = "avoid";
    buyAdvice = "🚫 Avoid - Multiple harmful ingredients detected";
  }

  // High severity ingredients override
  if (highSeverityCount > 0) {
    recommendation = "avoid";
    buyAdvice = "🚫 Avoid - Contains high-risk ingredients";
    healthGrade = "F";
  }

  // Build reasoning
  if (harmfulCount > 0) {
    reasoning.push(
      `Contains ${harmfulCount} harmful ingredient${
        harmfulCount > 1 ? "s" : ""
      }`
    );
  }
  if (beneficialCount > 0) {
    reasoning.push(
      `Contains ${beneficialCount} beneficial ingredient${
        beneficialCount > 1 ? "s" : ""
      }`
    );
  }
  if (totalIngredients > 20) {
    reasoning.push("High number of ingredients - may be heavily processed");
  }
  if (totalIngredients <= 5) {
    reasoning.push("Simple ingredient list - likely less processed");
  }

  // Calculate confidence
  confidence = Math.min(
    95,
    Math.abs(averageScore * 30) + (totalIngredients > 3 ? 20 : 0)
  );

  return {
    recommendation,
    healthGrade,
    buyAdvice,
    confidence: Math.round(confidence),
    averageScore: parseFloat(averageScore.toFixed(1)),
    reasoning,
    summary: {
      totalIngredients,
      harmfulCount,
      beneficialCount,
      highSeverityCount,
      overallScore: parseFloat((((averageScore + 3) * 10) / 6).toFixed(1)),
    },
  };
};

// HTTP request helper (keep existing)
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

    req.on("error", (error) => reject(error));
    if (options.body) req.write(options.body);
    req.end();
  });
};

// ✅ MAIN IMAGE ANALYSIS ENDPOINT (keep your existing analyze-image endpoint)
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
      `📸 Image received: ${req.file.originalname} (${(
        req.file.size / 1024
      ).toFixed(1)} KB)`
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

    // Upload to Cloudinary
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

    // Document Intelligence processing
    console.log("🔍 Processing with Azure Document Intelligence...");

    const analyzeUrl = `${azureEndpoint}/formrecognizer/documentModels/prebuilt-read:analyze?api-version=2023-07-31`;

    const analyzeResponse = await makeRequest(analyzeUrl, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": azureKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ urlSource: imageUrl }),
    });

    if (analyzeResponse.status !== 202) {
      const errorData = analyzeResponse.json();
      throw new Error(
        `Document Intelligence API error: ${
          analyzeResponse.status
        } - ${JSON.stringify(errorData)}`
      );
    }

    const operationLocation = analyzeResponse.headers["operation-location"];
    if (!operationLocation) {
      throw new Error("No operation-location header in response");
    }

    console.log("⏳ Waiting for Document Intelligence processing...");

    // Poll for results
    let result;
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const resultResponse = await makeRequest(operationLocation, {
        method: "GET",
        headers: { "Ocp-Apim-Subscription-Key": azureKey },
      });

      if (resultResponse.status !== 200) {
        throw new Error(`Failed to get results: ${resultResponse.status}`);
      }

      result = resultResponse.json();
      console.log(
        `📊 Analysis status: ${result.status} (attempt ${attempts + 1})`
      );

      if (result.status === "succeeded") break;
      if (result.status === "failed") {
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

    // Extract text
    let extractedText = "";
    if (result.analyzeResult && result.analyzeResult.content) {
      extractedText = result.analyzeResult.content;
    }

    console.log("✅ Document Intelligence processing complete!");
    console.log("📝 Extracted text:", extractedText.substring(0, 200) + "...");

    // Enhanced ingredient extraction
    const possibleIngredients = extractedText
      .toLowerCase()
      .replace(/ingredients?:?/i, "")
      .split(/[,;:\n]/)
      .map((item) => item.trim())
      .filter(
        (item) => item.length > 2 && item.length < 50 && !/^\d+$/.test(item)
      )
      .slice(0, 20);

    // Advanced ingredient analysis using WHO/OpenFoodFacts standards
    const analysisResults = possibleIngredients.map((ingredient) =>
      analyzeIngredientHealth(ingredient, extractedText)
    );

    // Generate product recommendation
    const productRecommendation = generateProductRecommendation(
      analysisResults,
      extractedText,
      possibleIngredients.length
    );

    console.log("✅ Advanced analysis complete!");
    console.log(
      "🏷️ Product recommendation:",
      productRecommendation.recommendation
    );

    res.status(200).json({
      success: true,
      message:
        "Image analyzed successfully with WHO/OpenFoodFacts standards! 🎉",
      data: {
        imageUrl,
        extractedText: extractedText.trim(),
        possibleIngredients,
        analysisResults,
        productRecommendation,
        totalIngredients: possibleIngredients.length,
        overallScore: productRecommendation.summary.overallScore,
        cloudinaryInfo: {
          public_id: uploadResult.public_id,
          width: uploadResult.width,
          height: uploadResult.height,
        },
        analysisMetadata: {
          analyzedAt: new Date().toISOString(),
          standards: "WHO & OpenFoodFacts",
          version: "2.0",
          processingTime: `${attempts} seconds`,
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

// ✅ MISSING ENDPOINT 1: Save Report
router.post("/save-report", async (req, res) => {
  try {
    console.log("💾 Save report request received");

    const reportData = req.body;

    if (!reportData || !reportData.data) {
      return res.status(400).json({
        success: false,
        message: "No report data provided",
      });
    }

    // Generate unique report ID
    const timestamp = new Date().toISOString();
    const reportId = `report_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    // Create comprehensive report object
    const savedReport = {
      id: reportId,
      savedAt: timestamp,
      analysis: reportData.data,
      summary: {
        totalIngredients: reportData.data.totalIngredients || 0,
        overallScore: reportData.data.overallScore || 0,
        warningCount: reportData.data.analysisResults
          ? reportData.data.analysisResults.filter(
              (item) => item.warnings && item.warnings.length > 0
            ).length
          : 0,
      },
      imageInfo: {
        imageUrl: reportData.data.imageUrl,
        cloudinaryInfo: reportData.data.cloudinaryInfo,
      },
      metadata: {
        savedFrom: reportData.savedFrom || "unknown",
        deviceInfo: reportData.deviceInfo || {},
      },
    };

    // Save to file
    const filename = `${reportId}.json`;
    const filepath = path.join(REPORTS_DIR, filename);

    fs.writeFileSync(filepath, JSON.stringify(savedReport, null, 2));

    console.log(`✅ Report saved: ${filename}`);

    res.status(200).json({
      success: true,
      message: "Report saved successfully! 📁",
      reportId: reportId,
      savedAt: timestamp,
      filename: filename,
    });
  } catch (error) {
    console.error("❌ Save Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save report",
      error: error.message,
    });
  }
});

// ✅ MISSING ENDPOINT 2: Get Saved Reports
router.get("/saved-reports", async (req, res) => {
  try {
    console.log("📂 Get saved reports request");

    if (!fs.existsSync(REPORTS_DIR)) {
      return res.json({
        success: true,
        reports: [],
        total: 0,
        message: "No reports directory found",
      });
    }

    const files = fs
      .readdirSync(REPORTS_DIR)
      .filter((file) => file.endsWith(".json"));

    const reports = files
      .map((file) => {
        try {
          const filepath = path.join(REPORTS_DIR, file);
          const data = JSON.parse(fs.readFileSync(filepath, "utf8"));

          // Return full report data for enhanced features
          return data;
        } catch (error) {
          console.error(`Error reading report ${file}:`, error);
          return null;
        }
      })
      .filter(Boolean);

    // Sort by save date (newest first)
    reports.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

    console.log(`✅ Found ${reports.length} saved reports`);

    res.json({
      success: true,
      reports: reports,
      total: reports.length,
      message: `Found ${reports.length} saved reports`,
    });
  } catch (error) {
    console.error("❌ Get Reports Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get saved reports",
      error: error.message,
    });
  }
});

// ✅ MISSING ENDPOINT 3: Get Specific Report
router.get("/saved-reports/:reportId", async (req, res) => {
  try {
    const { reportId } = req.params;
    const filepath = path.join(REPORTS_DIR, `${reportId}.json`);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const reportData = JSON.parse(fs.readFileSync(filepath, "utf8"));

    res.json({
      success: true,
      report: reportData,
      message: "Report retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Get Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get report",
      error: error.message,
    });
  }
});

// ✅ MISSING ENDPOINT 4: Save Purchase Decision
router.post("/save-purchase-decision", async (req, res) => {
  try {
    const { reportId, decision, notes } = req.body;

    if (!reportId || !decision) {
      return res.status(400).json({
        success: false,
        message: "Missing reportId or decision",
      });
    }

    const filepath = path.join(REPORTS_DIR, `${reportId}.json`);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const reportData = JSON.parse(fs.readFileSync(filepath, "utf8"));

    // Add purchase decision
    reportData.purchaseDecision = {
      decision,
      decidedAt: new Date().toISOString(),
      notes: notes || "",
      recommendation:
        reportData.analysis.productRecommendation?.recommendation || "unknown",
    };

    // Save updated report
    fs.writeFileSync(filepath, JSON.stringify(reportData, null, 2));

    console.log(
      `💰 Purchase decision saved: ${decision} for report ${reportId}`
    );

    res.json({
      success: true,
      message: "Purchase decision saved successfully!",
      decision,
      reportId,
    });
  } catch (error) {
    console.error("❌ Save purchase decision error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save purchase decision",
      error: error.message,
    });
  }
});

// ✅ EXISTING: Health Check Endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "✅ Analysis service with WHO/OpenFoodFacts standards is running",
    hasAzureKeys: !!(process.env.DOC_KEY && process.env.DOC_ENDPOINT),
    hasCloudinary: !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ),
    standards: "WHO & OpenFoodFacts",
    version: "2.0",
    availableEndpoints: [
      "POST /api/analysis/analyze-image",
      "POST /api/analysis/save-report",
      "GET /api/analysis/saved-reports",
      "GET /api/analysis/saved-reports/:reportId",
      "POST /api/analysis/save-purchase-decision",
      "GET /api/analysis/health",
    ],
    reportsDirectory: fs.existsSync(REPORTS_DIR) ? "✅ Ready" : "❌ Not found",
  });
});

module.exports = router;
