import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";

const ScanScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [facing, setFacing] = useState("back");
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const cameraRef = useRef(null);

  // ✅ SIMPLE: Backend configuration using localhost for both platforms
  // ✅ Backend configuration using your computer's IP address
  const getBackendUrl = () => {
    if (Platform.OS === "android") {
      return "http://192.168.43.18:3000"; // ← Your actual IP address
    } else if (Platform.OS === "ios") {
      return "http://localhost:3000";
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
      if (status !== "granted") {
        Alert.alert(
          "Camera Permission",
          "Camera permission is required to scan nutrition labels.",
          [{ text: "OK" }]
        );
      }
    })();
  }, []);

  const handleCapture = async () => {
    if (cameraRef.current && cameraReady && !isCapturing) {
      try {
        setIsCapturing(true);
        console.log("📸 Taking picture...");

        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false, // Don't need base64 for file upload
          skipProcessing: false,
        });

        console.log("✅ Picture taken:", photo.uri);
        setCapturedImage(photo.uri);
      } catch (error) {
        console.error("❌ Capture error:", error);
        Alert.alert(
          "Capture Failed",
          "Unable to capture photo. Please try again."
        );
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsAnalyzing(false);
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleAnalyze = async () => {
    if (!capturedImage) {
      Alert.alert("Error", "No image to analyze");
      return;
    }

    try {
      setIsAnalyzing(true);
      console.log("📤 Starting image analysis...");

      // ✅ FIXED: Enhanced FormData creation
      const formData = new FormData();

      // ✅ CRITICAL: Android requires file:// prefix
      const imageUri =
        Platform.OS === "android"
          ? capturedImage.startsWith("file://")
            ? capturedImage
            : `file://${capturedImage}`
          : capturedImage;

      formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: "ingredient-image.jpg",
      });

      console.log("🌐 Sending request to backend...");
      const backendUrl = getBackendUrl();
      console.log("Backend URL:", `${backendUrl}/api/analysis/analyze-image`);

      // ✅ FIXED: Enhanced fetch with proper headers and timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${backendUrl}/api/analysis/analyze-image`, {
        method: "POST",
        body: formData,
        headers: {
          // ✅ CRITICAL: Don't set Content-Type manually for FormData
          // Let browser set it automatically with boundary
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("📡 Response received! Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("✅ Analysis result:", result);

      if (result.success) {
        Alert.alert(
          "Analysis Complete! 🎉",
          `✅ Found ${result.data.totalIngredients} ingredients\n📊 Overall Health Score: ${result.data.overallScore}/10`,
          [
            {
              text: "View Full Report",
              onPress: () => showDetailedResults(result.data),
            },
            {
              text: "Take Another Photo",
              onPress: handleRetake,
            },
            { text: "OK" },
          ]
        );
      } else {
        throw new Error(result.message || "Analysis failed");
      }
    } catch (error) {
      console.error("❌ Analysis error:", error);

      let errorMessage = "Failed to analyze image. ";

      if (error.name === "AbortError") {
        errorMessage += "Request timed out. Server may be slow or unreachable.";
      } else if (error.message.includes("Network request failed")) {
        errorMessage +=
          "Cannot connect to server. Check if server is running and accessible.";
      } else if (error.message.includes("HTTP 400")) {
        errorMessage += "Bad request. Check server logs for details.";
      } else if (error.message.includes("HTTP 500")) {
        errorMessage += "Server error. Check server console for errors.";
      } else {
        errorMessage += error.message;
      }

      Alert.alert("Analysis Failed ❌", errorMessage, [
        {
          text: "Test Connection",
          onPress: testConnection,
        },
        {
          text: "Retry",
          onPress: handleAnalyze,
        },
        {
          text: "Take New Photo",
          onPress: handleRetake,
        },
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ✅ Connection test function
  const testConnection = async () => {
    try {
      const backendUrl = getBackendUrl();
      console.log("🧪 Testing connection to:", `${backendUrl}/api/health`);

      const response = await fetch(`${backendUrl}/api/health`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      console.log("🧪 Test response status:", response.status);
      const result = await response.json();
      console.log("🧪 Test response data:", result);

      Alert.alert(
        "✅ Connection Test Success!",
        `Server is reachable!\n\nResponse: ${result.message}`,
        [{ text: "Great! Try Analysis Again" }]
      );
    } catch (error) {
      console.error("🧪 Connection test failed:", error);
      Alert.alert(
        "❌ Connection Test Failed",
        `Cannot reach server: ${
          error.message
        }\n\n1. Is server running?\n2. Check URL: ${getBackendUrl()}\n3. Try ADB port forward`,
        [{ text: "OK" }]
      );
    }
  };

  // Show detailed analysis results
  const showDetailedResults = (analysisData) => {
    const {
      possibleIngredients,
      analysisResults,
      overallScore,
      extractedText,
    } = analysisData;

    let detailMessage = `📋 INGREDIENT ANALYSIS REPORT\n\n`;
    detailMessage += `🎯 Overall Health Score: ${overallScore}/10\n`;
    detailMessage += `🧾 Total Ingredients Found: ${possibleIngredients.length}\n\n`;

    if (analysisResults && analysisResults.length > 0) {
      detailMessage += `⚠️ HEALTH WARNINGS:\n`;
      analysisResults.forEach((ingredient) => {
        if (ingredient.warnings && ingredient.warnings.length > 0) {
          detailMessage += `• ${ingredient.name}: ${ingredient.warnings.join(
            ", "
          )}\n`;
        }
      });
      detailMessage += `\n`;
    }

    detailMessage += `📝 DETECTED TEXT:\n${extractedText.substring(0, 200)}${
      extractedText.length > 200 ? "..." : ""
    }`;

    Alert.alert("Detailed Analysis Report 📊", detailMessage, [
      {
        text: "Save Report",
        onPress: () => {
          // TODO: Implement save functionality
          Alert.alert(
            "Coming Soon",
            "Save functionality will be available in the next update!"
          );
        },
      },
      { text: "Close" },
    ]);
  };

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/health`);
      const result = await response.json();

      Alert.alert(
        "Backend Status",
        result.success
          ? "✅ Backend is connected!"
          : "❌ Backend connection failed",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert(
        "Connection Test",
        `❌ Backend unreachable: ${error.message}`
      );
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.containerCentered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.containerCentered}>
        <Text style={styles.errorText}>
          No access to camera. Please enable camera permissions in settings.
        </Text>
        <TouchableOpacity
          style={styles.testButton}
          onPress={testBackendConnection}
          activeOpacity={0.7}
        >
          <Text style={styles.testButtonText}>Test Backend Connection</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {!capturedImage ? (
        <View style={styles.cameraContainer}>
          {/* ✅ FIXED: CameraView without children */}
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            onCameraReady={() => {
              setCameraReady(true);
              console.log("📷 Camera ready");
            }}
          />

          {/* ✅ FIXED: Camera controls moved outside as absolute positioned overlay */}
          <View style={styles.cameraControlsOverlay}>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={toggleCameraFacing}
              activeOpacity={0.8}
            >
              <Ionicons name="camera-reverse" size={36} color="white" />
            </TouchableOpacity>
          </View>

          {/* ✅ FIXED: Instructions overlay moved outside as absolute positioned */}
          <View style={styles.instructionsOverlay}>
            <Text style={styles.instructionText}>
              📱 Point camera at ingredient label
            </Text>
            <Text style={styles.instructionSubtext}>
              Make sure text is clear and readable
            </Text>
          </View>

          {/* ✅ FIXED: Capture button positioned absolutely over camera */}
          <TouchableOpacity
            style={[
              styles.captureButton,
              (!cameraReady || isCapturing) && styles.captureButtonDisabled,
            ]}
            onPress={handleCapture}
            activeOpacity={0.7}
            disabled={isCapturing || !cameraReady}
          >
            <View
              style={[
                styles.captureInnerButton,
                isCapturing && styles.captureInnerButtonDisabled,
              ]}
            >
              {isCapturing && <ActivityIndicator size="small" color="white" />}
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />

          {isAnalyzing && (
            <View style={styles.analysisOverlay}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.analysisText}>Analyzing ingredients...</Text>
              <Text style={styles.analysisSubtext}>
                This may take a few seconds
              </Text>
            </View>
          )}

          <View style={styles.previewButtons}>
            <TouchableOpacity
              style={[
                styles.previewButton,
                isAnalyzing && styles.buttonDisabled,
              ]}
              onPress={handleRetake}
              activeOpacity={0.7}
              disabled={isAnalyzing}
            >
              <MaterialIcons name="refresh" size={24} color={Colors.primary} />
              <Text style={styles.previewButtonText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.previewButton,
                styles.analyzeButton,
                isAnalyzing && styles.buttonDisabled,
              ]}
              onPress={handleAnalyze}
              activeOpacity={0.7}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <MaterialIcons name="search" size={24} color="white" />
              )}
              <Text style={[styles.previewButtonText, { color: "white" }]}>
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  containerCentered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    paddingHorizontal: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  testButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  cameraControlsOverlay: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 30,
    padding: 6,
    zIndex: 1,
  },
  flipButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  instructionsOverlay: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 15,
    borderRadius: 10,
    zIndex: 1,
  },
  instructionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  instructionSubtext: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
    marginTop: 5,
    opacity: 0.8,
  },
  captureButton: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.primary,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureInnerButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  captureInnerButtonDisabled: {
    backgroundColor: Colors.primary + "80",
  },
  previewContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "90%",
    height: "75%",
    borderRadius: 15,
    marginBottom: 20,
  },
  analysisOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  analysisText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 15,
  },
  analysisSubtext: {
    color: "white",
    fontSize: 14,
    marginTop: 5,
    opacity: 0.8,
  },
  previewButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
  },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: "center",
  },
  analyzeButton: {
    backgroundColor: Colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  previewButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600",
  },
});

export default ScanScreen;
