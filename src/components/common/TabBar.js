import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";

const { width } = Dimensions.get("window");

const TabBar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "home", icon: "home", label: "Home" },
    { id: "tracker", icon: "analytics", label: "Tracker" },
    { id: "scan", icon: "scan", label: "Scan", isCenter: true },
    { id: "support", icon: "help-circle", label: "Support" },
    { id: "profile", icon: "person", label: "Profile" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, tab.isCenter && styles.centerTab]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            {tab.isCenter ? (
              <View style={styles.scanIconContainer}>
                <MaterialIcons name="qr-code-scanner" size={28} color="white" />
              </View>
            ) : (
              <>
                <Ionicons
                  name={tab.icon}
                  size={24}
                  color={
                    activeTab === tab.id ? Colors.primary : Colors.textLight
                  }
                />
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === tab.id && styles.activeTabLabel,
                  ]}
                >
                  {tab.label}
                </Text>
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 30, // ✅ CHANGED: Moved up from 0 to 30
    left: 0,
    right: 0,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    paddingVertical: 12, // ✅ CHANGED: Increased padding for better touch
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15, // ✅ CHANGED: Slightly more shadow
    shadowRadius: 10, // ✅ CHANGED: Better shadow spread
    borderTopLeftRadius: 20, // ✅ ADDED: Rounded top corners
    borderTopRightRadius: 20, // ✅ ADDED: Rounded top corners
    marginHorizontal: 10, // ✅ ADDED: Side margins for floating effect
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  centerTab: {
    marginTop: -25, // ✅ CHANGED: Moved up more for better float
  },
  scanIconContainer: {
    width: 65, // ✅ CHANGED: Slightly bigger
    height: 65, // ✅ CHANGED: Slightly bigger
    borderRadius: 32.5, // ✅ CHANGED: Perfect circle
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6, // ✅ CHANGED: Better elevation
    shadowColor: Colors.secondary, // ✅ CHANGED: Colored shadow
    shadowOffset: { width: 0, height: 3 }, // ✅ CHANGED: Better shadow
    shadowOpacity: 0.3, // ✅ CHANGED: More prominent shadow
    shadowRadius: 5, // ✅ CHANGED: Better shadow spread
    borderWidth: 3, // ✅ ADDED: White border for contrast
    borderColor: "white", // ✅ ADDED: White border
  },
  tabLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
    fontWeight: "500",
  },
  activeTabLabel: {
    color: Colors.primary,
    fontWeight: "600",
  },
});

export default TabBar;
