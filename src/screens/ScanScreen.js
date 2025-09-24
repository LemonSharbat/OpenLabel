import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "../constants/Colors";
import Header from "../components/common/Header";

const ScanScreen = ({ navigation }) => {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showCamera, setShowCamera] = useState(true);
  const cameraRef = useRef(null);

  // Backend URL function
  const getBackendUrl = () => {
    if (Platform.OS === "android") {
      return "http://192.168.43.18:3000"; // Your IP address
    } else if (Platform.OS === "ios") {
      return "http://localhost:3000";
    }
  };

  // Request camera permission
  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permissionButton}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Toggle camera facing
  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  // Take picture function
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        console.log("📸 Taking picture...");
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });

        console.log("✅ Picture taken:", photo.uri);
        setCapturedImage(photo.uri);
        setShowCamera(false);

        // Automatically analyze the image
        analyzeImage(photo.uri);
      } catch (error) {
        console.error("❌ Error taking picture:", error);
        Alert.alert("Error", "Failed to take picture. Please try again.");
      }
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    try {
      console.log("🖼️ Opening image picker...");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log("✅ Image selected:", imageUri);
        setCapturedImage(imageUri);
        setShowCamera(false);

        // Automatically analyze the selected image
        analyzeImage(imageUri);
      }
    } catch (error) {
      console.error("❌ Error picking image:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  // Analyze image function
  const analyzeImage = async (imageUri) => {
    try {
      setIsAnalyzing(true);
      console.log("🔍 Starting image analysis...");

      const backendUrl = getBackendUrl();
      console.log("🌐 Backend URL:", backendUrl);

      // Create FormData for image upload
      const formData = new FormData();
      formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: "ingredient-photo.jpg",
      });

      console.log("📤 Sending request to backend...");

      const response = await fetch(`${backendUrl}/api/analysis/analyze-image`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });

      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Response error:", errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("✅ Analysis result:", result);

      if (result.success) {
        console.log("🎉 Analysis successful!");
        showDetailedResults(result.data);
      } else {
        throw new Error(result.message || "Analysis failed");
      }
    } catch (error) {
      console.error("❌ Analysis error:", error);
      Alert.alert(
        "Analysis Failed ❌",
        `Could not analyze the image:\n\n${
          error.message
        }\n\nPlease ensure:\n• Your server is running on ${getBackendUrl()}\n• Internet connection is active\n• Image is clear and readable`,
        [
          {
            text: "Retry",
            onPress: () => analyzeImage(imageUri),
          },
          { text: "OK" },
        ]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Show detailed analysis results
  const showDetailedResults = (analysisData) => {
    const {
      possibleIngredients,
      analysisResults,
      productRecommendation,
      extractedText,
    } = analysisData;

    const recommendation = productRecommendation || {};
    const {
      healthGrade = "C",
      buyAdvice = "",
      confidence = 0,
      reasoning = [],
    } = recommendation;

    let detailMessage = `🏥 WHO HEALTH ANALYSIS REPORT\n\n`;
    detailMessage += `📊 Health Grade: ${healthGrade}\n`;
    detailMessage += `🎯 Overall Score: ${
      recommendation.summary?.overallScore || 0
    }/10\n`;
    detailMessage += `📈 Confidence: ${confidence}%\n`;
    detailMessage += `🧾 Total Ingredients: ${possibleIngredients.length}\n\n`;

    detailMessage += `💡 WHO RECOMMENDATION:\n${buyAdvice}\n\n`;

    if (reasoning && reasoning.length > 0) {
      detailMessage += `🔍 REASONING:\n`;
      reasoning.forEach((reason) => {
        detailMessage += `• ${reason}\n`;
      });
      detailMessage += `\n`;
    }

    if (analysisResults && analysisResults.length > 0) {
      const harmfulIngredients = analysisResults.filter(
        (ing) => ing.category === "harmful"
      );
      const beneficialIngredients = analysisResults.filter(
        (ing) => ing.category === "beneficial"
      );

      if (harmfulIngredients.length > 0) {
        detailMessage += `⚠️ CONCERNING INGREDIENTS:\n`;
        harmfulIngredients.forEach((ingredient) => {
          detailMessage += `• ${ingredient.name}: ${ingredient.warnings.join(
            ", "
          )}\n`;
        });
        detailMessage += `\n`;
      }

      if (beneficialIngredients.length > 0) {
        detailMessage += `✅ BENEFICIAL INGREDIENTS:\n`;
        beneficialIngredients.forEach((ingredient) => {
          detailMessage += `• ${ingredient.name}: ${ingredient.benefits.join(
            ", "
          )}\n`;
        });
        detailMessage += `\n`;
      }
    }

    detailMessage += `📝 DETECTED TEXT:\n${extractedText.substring(0, 150)}${
      extractedText.length > 150 ? "..." : ""
    }`;

    Alert.alert("🏥 WHO Health Analysis Report", detailMessage, [
      {
        text: "💰 Purchase Decision",
        onPress: () => showPurchaseDecision(analysisData),
      },
      {
        text: "💾 Save Report",
        onPress: () => saveReport(analysisData),
      },
      { text: "Close" },
    ]);
  };

  // Save report function
  const saveReport = async (analysisData) => {
    try {
      console.log("💾 Saving report...");

      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/analysis/save-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          data: analysisData,
          savedFrom: "mobile_app_scan",
          deviceInfo: {
            platform: Platform.OS,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const result = await response.json();
      console.log("💾 Save result:", result);

      if (result.success) {
        Alert.alert(
          "Report Saved! 📁",
          `Your WHO health analysis has been saved successfully!\n\n📋 Report ID: ${
            result.reportId
          }\n📅 Saved: ${new Date(
            result.savedAt
          ).toLocaleString()}\n\n🏥 Includes:\n• WHO health grade: ${
            analysisData.productRecommendation?.healthGrade || "N/A"
          }\n• Product recommendation\n• Ingredient analysis\n• Image preview`,
          [
            {
              text: "📊 View All Reports",
              onPress: () => {
                Alert.alert(
                  "View Saved Reports",
                  "Go to Home screen → Tap 'Scan History' to view all your saved WHO health analyses!",
                  [{ text: "Got it!" }]
                );
              },
            },
            { text: "Great!" },
          ]
        );
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("❌ Save report error:", error);
      Alert.alert(
        "Save Failed ❌",
        `Failed to save report: ${error.message}\n\nPlease check:\n• Internet connection\n• Server is running\n• Try again`,
        [{ text: "OK" }]
      );
    }
  };

  // Show purchase decision
  const showPurchaseDecision = (analysisData) => {
    const recommendation =
      analysisData.productRecommendation?.recommendation || "neutral";
    const buyAdvice = analysisData.productRecommendation?.buyAdvice || "";

    Alert.alert(
      "🛒 Purchase Decision",
      `${buyAdvice}\n\nDid you decide to buy this product?`,
      [
        {
          text: "✅ Yes, I Bought It",
          onPress: () => savePurchaseDecision(analysisData, "bought"),
        },
        {
          text: "❌ No, I Didn't Buy",
          onPress: () => savePurchaseDecision(analysisData, "not_bought"),
        },
        {
          text: "🤔 Still Deciding",
          style: "cancel",
        },
      ]
    );
  };

  // Save purchase decision
  const savePurchaseDecision = async (analysisData, decision) => {
    try {
      console.log("💰 Saving purchase decision...");

      // First save the analysis report
      const backendUrl = getBackendUrl();
      const reportResponse = await fetch(
        `${backendUrl}/api/analysis/save-report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            data: analysisData,
            savedFrom: "mobile_app_purchase_decision",
            deviceInfo: {
              platform: Platform.OS,
              timestamp: new Date().toISOString(),
            },
          }),
        }
      );

      const reportResult = await reportResponse.json();

      if (!reportResult.success) {
        throw new Error("Failed to save report");
      }

      // Then save the purchase decision
      const decisionResponse = await fetch(
        `${backendUrl}/api/analysis/save-purchase-decision`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            reportId: reportResult.reportId,
            decision: decision,
            notes: "",
          }),
        }
      );

      const decisionResult = await decisionResponse.json();

      if (decisionResult.success) {
        const recommendation =
          analysisData.productRecommendation?.recommendation || "neutral";
        const isGoodChoice =
          (decision === "bought" && recommendation === "buy") ||
          (decision === "not_bought" && recommendation === "avoid");

        let message = "";
        if (decision === "bought") {
          message = isGoodChoice
            ? "✅ Excellent choice! You followed the WHO health recommendation."
            : "⚠️ Purchase noted. Be mindful of the health concerns identified by WHO standards.";
        } else {
          message = isGoodChoice
            ? "👏 Smart decision! You avoided a product with WHO health concerns."
            : "📝 Decision noted. Consider the missed healthy benefits next time.";
        }

        Alert.alert(
          "💰 Purchase Decision Saved!",
          `${message}\n\n📊 Your decision helps us:\n• Learn your preferences\n• Improve WHO recommendations\n• Track your health progress\n\n📅 Saved: ${new Date().toLocaleString()}`,
          [
            {
              text: "📊 View History",
              onPress: () => {
                Alert.alert(
                  "View History",
                  "Go to Home screen → Scan History to see all your decisions!",
                  [{ text: "OK" }]
                );
              },
            },
            { text: "Perfect!" },
          ]
        );
      } else {
        throw new Error(decisionResult.message);
      }
    } catch (error) {
      console.error("❌ Save purchase decision error:", error);
      Alert.alert(
        "Save Failed ❌",
        `Failed to save purchase decision: ${error.message}`,
        [{ text: "OK" }]
      );
    }
  };

  // Reset to camera view
  const resetCamera = () => {
    setCapturedImage(null);
    setShowCamera(true);
    setIsAnalyzing(false);
  };

  // Render camera view
  if (showCamera) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />

        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
            {/* Camera overlay */}
            <View style={styles.overlay}>
              <View style={styles.topOverlay}>
                <Text style={styles.instructionText}>
                  📸 Point camera at ingredient label
                </Text>
                <Text style={styles.subInstructionText}>
                  🏥 Get WHO health analysis instantly
                </Text>
              </View>

              {/* Scanning frame */}
              <View style={styles.scanFrame}>
                <View style={styles.corner} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>

              <View style={styles.bottomOverlay}>
                <TouchableOpacity
                  style={styles.galleryButton}
                  onPress={pickImage}
                >
                  <Text style={styles.galleryButtonText}>📁</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={takePicture}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.flipButton}
                  onPress={toggleCameraFacing}
                >
                  <Text style={styles.flipButtonText}>🔄</Text>
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        </View>

        {/* Help text */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            💡 <Text style={styles.helpBold}>Tips for best results:</Text>
          </Text>
          <Text style={styles.helpSubtext}>
            • Ensure good lighting • Hold phone steady • Focus on ingredient
            list • Avoid shadows
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render captured image with analysis
  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <ScrollView style={styles.resultContainer}>
        {capturedImage && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: capturedImage }}
              style={styles.capturedImage}
            />

            {isAnalyzing && (
              <View style={styles.analyzingOverlay}>
                <View style={styles.analyzingContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text style={styles.analyzingText}>
                    🏥 Analyzing with WHO standards...
                  </Text>
                  <Text style={styles.analyzingSubtext}>
                    Checking ingredients against health guidelines
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.retakeButton]}
            onPress={resetCamera}
          >
            <Text style={styles.actionButtonText}>📸 Retake Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.analyzeButton]}
            onPress={() => capturedImage && analyzeImage(capturedImage)}
            disabled={isAnalyzing}
          >
            <Text style={styles.actionButtonText}>
              {isAnalyzing ? "⏳ Analyzing..." : "🔍 Analyze Again"}
            </Text>
          </TouchableOpacity>
        </View>

        {!isAnalyzing && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>
              🏥 WHO Health Analysis Features:
            </Text>
            <Text style={styles.infoText}>
              • Health grade rating (A-F scale)
            </Text>
            <Text style={styles.infoText}>• Buy/Avoid recommendations</Text>
            <Text style={styles.infoText}>• Ingredient safety assessment</Text>
            <Text style={styles.infoText}>• Purchase decision tracking</Text>
            <Text style={styles.infoText}>• Comprehensive health reports</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    fontSize: 16,
    color: Colors.text,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cameraContainer: {
    flex: 1,
    margin: 10,
    borderRadius: 20,
    overflow: "hidden",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  topOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  instructionText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  subInstructionText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
    opacity: 0.9,
  },
  scanFrame: {
    width: 300,
    height: 200,
    alignSelf: "center",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: Colors.primary,
    borderWidth: 3,
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    left: "auto",
    borderLeftWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    top: "auto",
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: "auto",
    left: "auto",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  bottomOverlay: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 30,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  galleryButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryButtonText: {
    fontSize: 24,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
  },
  flipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  flipButtonText: {
    fontSize: 24,
  },
  helpContainer: {
    padding: 20,
    backgroundColor: Colors.surface,
    margin: 10,
    borderRadius: 15,
  },
  helpText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  helpBold: {
    fontWeight: "bold",
  },
  helpSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  resultContainer: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
  },
  capturedImage: {
    width: "100%",
    height: 400,
    resizeMode: "contain",
    backgroundColor: Colors.surface,
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  analyzingContainer: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    margin: 20,
  },
  analyzingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 15,
    textAlign: "center",
  },
  analyzingSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 5,
    textAlign: "center",
  },
  actionContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  retakeButton: {
    backgroundColor: Colors.textSecondary,
  },
  analyzeButton: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  infoContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 5,
    paddingLeft: 10,
  },
});

export default ScanScreen;
