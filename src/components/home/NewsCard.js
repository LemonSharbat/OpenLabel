import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";

const NewsCard = ({ article }) => {
  return (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: article.image }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.categoryRow}>
          <Text style={styles.category}>{article.category}</Text>
          <Text style={styles.readTime}>{article.readTime}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={styles.summary} numberOfLines={2}>
          {article.summary}
        </Text>
        <View style={styles.footer}>
          <Ionicons name="time-outline" size={14} color={Colors.textLight} />
          <Text style={styles.footerText}>2 hours ago</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 150,
    backgroundColor: Colors.border,
  },
  content: {
    padding: 15,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600",
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  readTime: {
    fontSize: 12,
    color: Colors.textLight,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 22,
  },
  summary: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
});

export default NewsCard;
