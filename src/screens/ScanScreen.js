// src/screens/ScanScreen.js
import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { Colors } from "../constants/Colors";

const ScanScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>📷 Scan Screen</Text>
        <Text style={styles.subtitle}>Camera functionality coming soon</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
