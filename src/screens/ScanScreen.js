import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context"; // FIXED: Use this instead
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";

const ScanScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [facing, setFacing] = useState("back"); // FIXED: Use string instead of Camera.Constants.Type
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const cameraRef = useRef(null);

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
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
          skipProcessing: true,
        });
        setCapturedImage(photo.uri);
      } catch (error) {
        console.error("Capture error:", error);
        Alert.alert("Capture Failed", "Unable to capture photo. Try again.");
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  // FIXED: Toggle camera function
  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleAnalyze = async () => {
    if (!capturedImage) return;

    try {
      Alert.alert("Processing", "Sending image for analysis...");

      // TODO: Send image to your backend
      // const formData = new FormData();
      // formData.append('image', {
      //   uri: capturedImage,
      //   type: 'image/jpeg',
      //   name: 'ingredient-image.jpg',
      // });

      // const response = await fetch('http://your-server:5000/api/upload-image', {
      //   method: 'POST',
      //   body: formData,
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });

      // const result = await response.json();
      // if (result.success) {
      //   // Navigate to results screen or show results
      // }
    } catch (error) {
      console.error("Analysis error:", error);
      Alert.alert("Analysis Failed", "Unable to analyze image. Try again.");
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {!capturedImage ? (
        <View style={styles.cameraContainer}>
          {/* FIXED: Use CameraView with facing prop */}
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            onCameraReady={() => setCameraReady(true)}
          >
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={toggleCameraFacing}
                activeOpacity={0.8}
              >
                <Ionicons name="camera-reverse" size={36} color="white" />
              </TouchableOpacity>
            </View>
          </CameraView>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
            activeOpacity={0.7}
            disabled={isCapturing || !cameraReady}
          >
            <View
              style={[
                styles.captureInnerButton,
                isCapturing && styles.captureInnerButtonDisabled,
              ]}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          <View style={styles.previewButtons}>
            <TouchableOpacity
              style={styles.previewButton}
              onPress={handleRetake}
              activeOpacity={0.7}
            >
              <MaterialIcons name="refresh" size={24} color={Colors.primary} />
              <Text style={styles.previewButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.previewButton}
              onPress={handleAnalyze}
              activeOpacity={0.7}
            >
              <MaterialIcons name="send" size={24} color={Colors.primary} />
              <Text style={styles.previewButtonText}>Analyze</Text>
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
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 30,
    padding: 6,
  },
  flipButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    position: "absolute",
    bottom: 80, // Changed from 40 to 80 (moves button higher)
    alignSelf: "center",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  captureInnerButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
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
  previewButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "70%",
  },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  previewButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600",
  },
  previewButtonIcon: {
    color: Colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});

export default ScanScreen;
