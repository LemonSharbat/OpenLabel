import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Colors } from "../constants/Colors";
import Header from "../components/common/Header";

const HomeScreen = () => {
  const healthyIngredients = [
    {
      id: 1,
      name: "Organic Oats",
      benefits: "High fiber, heart-healthy",
      icon: "🌾",
    },
    {
      id: 2,
      name: "Probiotics",
      benefits: "Gut health, immunity boost",
      icon: "🦠",
    },
    {
      id: 3,
      name: "Green Tea",
      benefits: "Antioxidants, metabolism",
      icon: "🍃",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Hello! 👋</Text>
          <Text style={styles.welcomeSubtext}>
            Discover healthy ingredients and make smart food choices
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statNumber}>1,247</Text>
            <Text style={styles.statLabel}>Products Scanned</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statNumber}>89%</Text>
            <Text style={styles.statLabel}>Healthy Choices</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>📈</Text>
            <Text style={styles.statNumber}>+15%</Text>
            <Text style={styles.statLabel}>Health Score</Text>
          </View>
        </View>

        {/* Ingredient Spotlight */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌟 Ingredient Spotlight</Text>
          <Text style={styles.sectionSubtitle}>
            Learn about healthy ingredients to look for
          </Text>

          {healthyIngredients.map((ingredient) => (
            <TouchableOpacity key={ingredient.id} style={styles.ingredientCard}>
              <Text style={styles.ingredientIcon}>{ingredient.icon}</Text>
              <View style={styles.ingredientContent}>
                <Text style={styles.ingredientName}>{ingredient.name}</Text>
                <Text style={styles.ingredientBenefits}>
                  {ingredient.benefits}
                </Text>
              </View>
              <Text style={styles.chevron}>▶️</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Latest News */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📰 Latest News</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSubtitle}>
            Stay updated with nutrition and health news
          </Text>

          <TouchableOpacity style={styles.newsCard}>
            <View style={styles.newsImagePlaceholder}>
              <Text style={styles.newsImageText}>🥗</Text>
            </View>
            <View style={styles.newsContent}>
              <Text style={styles.newsCategory}>Health</Text>
              <Text style={styles.newsTitle}>
                New Study: Organic Foods Reduce Cancer Risk by 25%
              </Text>
              <Text style={styles.newsTime}>2 hours ago • 3 min read</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.newsCard}>
            <View style={styles.newsImagePlaceholder}>
              <Text style={styles.newsImageText}>🍯</Text>
            </View>
            <View style={styles.newsContent}>
              <Text style={styles.newsCategory}>Education</Text>
              <Text style={styles.newsTitle}>
                Hidden Sugars: What Food Labels Don't Tell You
              </Text>
              <Text style={styles.newsTime}>4 hours ago • 5 min read</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.newsCard}>
            <View style={styles.newsImagePlaceholder}>
              <Text style={styles.newsImageText}>🏛️</Text>
            </View>
            <View style={styles.newsContent}>
              <Text style={styles.newsCategory}>Regulation</Text>
              <Text style={styles.newsTitle}>
                FDA Updates Nutrition Label Requirements
              </Text>
              <Text style={styles.newsTime}>1 day ago • 4 min read</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction}>
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: Colors.primary },
                ]}
              >
                <Text style={styles.quickActionIconText}>🔍</Text>
              </View>
              <Text style={styles.quickActionText}>Search Products</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction}>
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: Colors.warning },
                ]}
              >
                <Text style={styles.quickActionIconText}>⭐</Text>
              </View>
              <Text style={styles.quickActionText}>Saved Items</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction}>
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: Colors.info },
                ]}
              >
                <Text style={styles.quickActionIconText}>🕒</Text>
              </View>
              <Text style={styles.quickActionText}>Scan History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ✨ NEW: Points Earned Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Points Earned</Text>
          <Text style={styles.sectionSubtitle}>
            Earn points by making healthy choices and unlock rewards!
          </Text>

          {/* Points Summary Card */}
          <View style={styles.pointsCard}>
            <View style={styles.pointsHeader}>
              <View style={styles.pointsMainInfo}>
                <Text style={styles.totalPoints}>2,450</Text>
                <Text style={styles.pointsLabel}>Total Points</Text>
              </View>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsBadgeText}>🥇</Text>
                <Text style={styles.levelText}>Gold</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>
                Next level: 550 points to go
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: "82%" }]} />
              </View>
            </View>
          </View>

          {/* Recent Points Activities */}
          <View style={styles.pointsActivities}>
            <TouchableOpacity style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityEmoji}>🥗</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Healthy Choice Bonus</Text>
                <Text style={styles.activityTime}>
                  Scanned organic product • 2h ago
                </Text>
              </View>
              <View style={styles.pointsEarned}>
                <Text style={styles.pointsText}>+50</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityEmoji}>📸</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Daily Scan Goal</Text>
                <Text style={styles.activityTime}>
                  Scanned 5 products today • 4h ago
                </Text>
              </View>
              <View style={styles.pointsEarned}>
                <Text style={styles.pointsText}>+100</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityEmoji}>⭐</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Weekly Streak</Text>
                <Text style={styles.activityTime}>
                  7 days of healthy choices • 1d ago
                </Text>
              </View>
              <View style={styles.pointsEarned}>
                <Text style={styles.pointsText}>+200</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Available Rewards */}
          <View style={styles.rewardsSection}>
            <Text style={styles.rewardsTitle}>🎁 Available Rewards</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity style={styles.rewardCard}>
                <Text style={styles.rewardEmoji}>☕</Text>
                <Text style={styles.rewardTitle}>Coffee Voucher</Text>
                <Text style={styles.rewardCost}>500 points</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.rewardCard}>
                <Text style={styles.rewardEmoji}>🥤</Text>
                <Text style={styles.rewardTitle}>Healthy Smoothie</Text>
                <Text style={styles.rewardCost}>750 points</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.rewardCard}>
                <Text style={styles.rewardEmoji}>🛒</Text>
                <Text style={styles.rewardTitle}>Grocery Discount</Text>
                <Text style={styles.rewardCost}>1000 points</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: Colors.surface,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  ingredientCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  ingredientIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  ingredientContent: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  ingredientBenefits: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chevron: {
    fontSize: 16,
    color: Colors.textLight,
  },
  newsCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    flexDirection: "row",
    overflow: "hidden",
  },
  newsImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  newsImageText: {
    fontSize: 30,
  },
  newsContent: {
    flex: 1,
    padding: 15,
  },
  newsCategory: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 5,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 18,
  },
  newsTime: {
    fontSize: 12,
    color: Colors.textLight,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  quickAction: {
    alignItems: "center",
    flex: 1,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionIconText: {
    fontSize: 24,
    color: "white",
  },
  quickActionText: {
    fontSize: 12,
    color: Colors.text,
    textAlign: "center",
    fontWeight: "500",
  },

  // ✨ NEW: Points Section Styles
  pointsCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  pointsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  pointsMainInfo: {
    flex: 1,
  },
  totalPoints: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 5,
  },
  pointsLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "600",
  },
  pointsBadge: {
    alignItems: "center",
    backgroundColor: "#FFD700",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  pointsBadgeText: {
    fontSize: 24,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  progressContainer: {
    marginTop: 10,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFD700",
  },
  pointsActivities: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    padding: 15,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityEmoji: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  pointsEarned: {
    backgroundColor: Colors.success + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.success,
  },
  rewardsSection: {
    marginHorizontal: 20,
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 15,
  },
  rewardCard: {
    backgroundColor: Colors.surface,
    width: 120,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rewardEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  rewardTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 5,
  },
  rewardCost: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: "bold",
  },

  bottomSpacing: {
    height: 20,
  },
});

export default HomeScreen;
