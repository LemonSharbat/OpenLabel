import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";

const Header = () => {
  // Animated badge scale
  const badgeScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(badgeScale, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(badgeScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <View style={styles.header}>
      {/* Background Gradient Effect */}
      <View style={styles.gradientOverlay} />

      <View style={styles.headerContent}>
        <View style={styles.logoSection}>
          {/* Circular Logo with Border */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/logo.jpg")}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.title}>OpenLabel</Text>
            <Text style={styles.subtitle}>Smart Nutrition Analysis</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <Ionicons name="notifications" size={20} color="white" />
            <Animated.View
              style={[
                styles.notificationBadge,
                { transform: [{ scale: badgeScale }] },
              ]}
            >
              <Text style={styles.badgeText}>3</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    position: "relative",
    overflow: "hidden",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.05)",
    opacity: 0.7,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 2,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24, // Perfect circle
    backgroundColor: "white",
    padding: 3,
    marginRight: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoImage: {
    width: 42,
    height: 42,
    borderRadius: 21, // Circular image
  },
  titleSection: {
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    letterSpacing: 0.8,
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
    marginTop: 2,
    letterSpacing: 0.3,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    backgroundColor: Colors.secondary,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    elevation: 2,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  badgeText: {
    fontSize: 10,
    color: "white",
    fontWeight: "bold",
  },
});

export default Header;
