import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../../constants/Colors";

const IngredientSpotlight = ({ ingredient }) => {
  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: ingredient.color }]}
    >
      <Text style={styles.icon}>{ingredient.icon}</Text>
      <Text style={styles.name}>{ingredient.name}</Text>
      <Text style={styles.benefits}>{ingredient.benefits}</Text>
      <View style={[styles.badge, { backgroundColor: ingredient.color }]}>
        <Text style={styles.badgeText}>Learn More</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    width: 160,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 6,
  },
  benefits: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 10,
    color: "white",
    fontWeight: "600",
  },
});

export default IngredientSpotlight;
