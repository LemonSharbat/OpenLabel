import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";

// Import screens
import HomeScreen from "./src/screens/HomeScreen";
import ScanScreen from "./src/screens/ScanScreen";
import TrackerScreen from "./src/screens/TrackerScreen";
import SupportScreen from "./src/screens/SupportScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

// Import components
import TabBar from "./src/components/common/TabBar";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  const renderActiveScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen />;
      case "tracker":
        return <TrackerScreen />;
      case "scan":
        return <ScanScreen />;
      case "support":
        return <SupportScreen />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#2E7D32" />

      {/* Main Content */}
      <View style={styles.content}>{renderActiveScreen()}</View>

      {/* Bottom Tab Bar */}
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
  },
});
