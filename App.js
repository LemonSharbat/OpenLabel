import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";

// Import screens
import AuthScreen from "./src/screens/AuthScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ScanScreen from "./src/screens/ScanScreen";
import TrackerScreen from "./src/screens/TrackerScreen";
import SupportScreen from "./src/screens/SupportScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

// Import components
import TabBar from "./src/components/common/TabBar";
import { tokenManager } from "./src/services/api";
import { Colors } from "./src/constants/Colors";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await tokenManager.initializeToken();
        if (token) {
          // TODO: Fetch user profile if needed
          // const profile = await authAPI.getProfile();
          // setUser(profile.user);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleAuthSuccess = (user) => {
    setUser(user);
    setActiveTab("home");
  };

  const handleLogout = async () => {
    try {
      await tokenManager.removeToken();
      setUser(null);
      setActiveTab("home");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const renderMainTabs = () => {
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
        return <ProfileScreen user={user} onLogout={handleLogout} />;
      default:
        return <HomeScreen />;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" backgroundColor="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#667eea" />
      {!user ? (
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      ) : (
        <>
          <View style={styles.content}>{renderMainTabs()}</View>
          <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
