import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
  Modal,
  Dimensions,
  LinearGradient,
} from "react-native";
import { Colors } from "../constants/Colors";
import Header from "../components/common/Header";

const { width, height } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);

  // Quiz state variables (keep existing)
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);

  // Backend URL function (keep existing)
  const getBackendUrl = () => {
    if (Platform.OS === "android") {
      return "http://192.168.43.18:3000";
    } else if (Platform.OS === "ios") {
      return "http://localhost:3000";
    }
  };

  // Keep all existing quiz functions...
  const quizQuestions = [
    {
      id: 1,
      question: "Which ingredient should you avoid for heart health?",
      image:
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
      options: ["Trans Fat", "Protein", "Fiber", "Vitamin C"],
      correctAnswer: 0,
      explanation:
        "Trans fats increase bad cholesterol and should be avoided for heart health.",
    },
    {
      id: 2,
      question: "What does 'High Fructose Corn Syrup' indicate?",
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      options: [
        "Healthy natural sweetener",
        "Added sugar to avoid",
        "Essential vitamin",
        "Protein source",
      ],
      correctAnswer: 1,
      explanation:
        "High Fructose Corn Syrup is a processed sweetener linked to health issues.",
    },
    {
      id: 3,
      question: "Which preservative is commonly found in processed foods?",
      image:
        "https://images.unsplash.com/photo-1571768420377-4de1d30eea3d?w=400&h=300&fit=crop",
      options: ["Vitamin E", "Sodium Benzoate", "Calcium", "Iron"],
      correctAnswer: 1,
      explanation:
        "Sodium Benzoate is a common preservative that may cause health issues in large amounts.",
    },
    {
      id: 4,
      question: "What should you look for in a healthy snack?",
      image:
        "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&h=300&fit=crop",
      options: [
        "High sugar content",
        "Artificial colors",
        "High fiber and protein",
        "Multiple preservatives",
      ],
      correctAnswer: 2,
      explanation:
        "High fiber and protein help you feel full and provide sustained energy.",
    },
    {
      id: 5,
      question: "Which term indicates the healthiest option?",
      image:
        "https://images.unsplash.com/photo-1563414685-efcf984c9582?w=400&h=300&fit=crop",
      options: [
        "Artificially flavored",
        "Organic",
        "High sodium",
        "Contains MSG",
      ],
      correctAnswer: 1,
      explanation:
        "Organic foods are produced without synthetic pesticides, fertilizers, or GMOs.",
    },
  ];

  // Keep all existing functions (quiz functions, etc.)
  const viewPointsAndRewards = async () => {
    try {
      setIsLoadingPoints(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const pointsData = {
        totalPoints: 2450,
        quizPoints: 45,
        scanPoints: 2405,
        level: "Gold",
        levelProgress: 82,
        pointsToNext: 550,
        badges: ["beginner", "learner"],
        quizzesCompleted: 9,
        averageScore: 4.2,
      };
      showMainPointsMenu(pointsData);
    } catch (error) {
      Alert.alert("Unable to Load Points", `Error: ${error.message}`, [
        { text: "OK" },
      ]);
    } finally {
      setIsLoadingPoints(false);
    }
  };

  // Keep all other existing functions...
  const showMainPointsMenu = (pointsData) => {
    Alert.alert(
      "🏆 Points & Rewards Hub",
      `💰 Total Points: ${pointsData.totalPoints}`,
      [{ text: "🧩 Take Quiz", onPress: () => startQuiz() }, { text: "Close" }]
    );
  };

  const startQuiz = () => {
    Alert.alert("🧩 Food Label Quiz", "Ready to start?", [
      {
        text: "🚀 Start Quiz",
        onPress: () => {
          setCurrentQuestion(0);
          setQuizScore(0);
          setQuizCompleted(false);
          setUserAnswers([]);
          setSelectedAnswer(null);
          setShowQuizModal(true);
        },
      },
      { text: "Cancel" },
    ]);
  };

  const viewScanHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/analysis/saved-reports`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      const result = await response.json();
      if (result.success && result.reports.length === 0) {
        Alert.alert("No Scan History 📝", "Start scanning!", [{ text: "OK" }]);
      }
    } catch (error) {
      Alert.alert("Unable to Load History", `Error: ${error.message}`, [
        { text: "OK" },
      ]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const searchProducts = () =>
    Alert.alert("🔍 Search Products", "Coming soon!", [{ text: "OK" }]);
  const viewSavedItems = () =>
    Alert.alert("⭐ Saved Items", "Coming soon!", [{ text: "OK" }]);

  const healthyIngredients = [
    {
      id: 1,
      name: "Organic Oats",
      benefits: "Rich in fiber, supports heart health",
      icon: "🌾",
      color: "#4CAF50",
    },
    {
      id: 2,
      name: "Probiotics",
      benefits: "Enhances gut health & immunity",
      icon: "🦠",
      color: "#FF9800",
    },
    {
      id: 3,
      name: "Green Tea Extract",
      benefits: "Powerful antioxidants, boosts metabolism",
      icon: "🍃",
      color: "#8BC34A",
    },
    {
      id: 4,
      name: "Omega-3 Fatty Acids",
      benefits: "Brain health, reduces inflammation",
      icon: "🐟",
      color: "#2196F3",
    },
  ];

  const trendingNews = [
    {
      id: 1,
      category: "Research",
      title: "New Study: Organic Foods Reduce Cancer Risk by 25%",
      summary:
        "Large-scale research reveals significant health benefits of organic consumption",
      time: "2 hours ago",
      readTime: "3 min read",
      icon: "🥗",
      color: "#4CAF50",
    },
    {
      id: 2,
      category: "Education",
      title: "Hidden Sugars: What Food Labels Don't Tell You",
      summary:
        "Learn to identify 56 different names for sugar in processed foods",
      time: "4 hours ago",
      readTime: "5 min read",
      icon: "🍯",
      color: "#FF9800",
    },
    {
      id: 3,
      category: "Regulation",
      title: "FDA Updates Nutrition Label Requirements",
      summary: "New transparency rules for food manufacturers take effect",
      time: "1 day ago",
      readTime: "4 min read",
      icon: "🏛️",
      color: "#2196F3",
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
        {/* ✅ ENHANCED: Hero Welcome Section with Gradient */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeEmoji}>👋</Text>
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.heroTitle}>Welcome Back!</Text>
                <Text style={styles.heroSubtitle}>
                  Your journey to healthier eating continues
                </Text>
              </View>
            </View>
            <View style={styles.heroImageContainer}>
              <Text style={styles.heroImageEmoji}>🥗</Text>
            </View>
          </View>
        </View>

        {/* ✅ ENHANCED: Modern Stats Dashboard */}
        <View style={styles.statsSection}>
          <Text style={styles.statsSectionTitle}>Your Health Journey</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.statCardPrimary]}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>📊</Text>
              </View>
              <Text style={styles.statNumber}>1,247</Text>
              <Text style={styles.statLabel}>Products Scanned</Text>
              <View style={styles.statTrend}>
                <Text style={styles.statTrendText}>↗ +12 this week</Text>
              </View>
            </View>

            <View style={[styles.statCard, styles.statCardSuccess]}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>✅</Text>
              </View>
              <Text style={styles.statNumber}>89%</Text>
              <Text style={styles.statLabel}>Healthy Choices</Text>
              <View style={styles.statTrend}>
                <Text style={styles.statTrendText}>↗ +5% improved</Text>
              </View>
            </View>

            <View style={[styles.statCard, styles.statCardWarning]}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>🏆</Text>
              </View>
              <Text style={styles.statNumber}>2,450</Text>
              <Text style={styles.statLabel}>Total Points</Text>
              <View style={styles.statTrend}>
                <Text style={styles.statTrendText}>↗ +150 earned</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ✅ ENHANCED: Premium Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardPrimary]}
              onPress={searchProducts}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: "#667eea" },
                ]}
              >
                <Text style={styles.actionIcon}>🔍</Text>
              </View>
              <Text style={styles.actionTitle}>Search Products</Text>
              <Text style={styles.actionSubtitle}>Find healthy options</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardSuccess]}
              onPress={viewSavedItems}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: "#f093fb" },
                ]}
              >
                <Text style={styles.actionIcon}>⭐</Text>
              </View>
              <Text style={styles.actionTitle}>Saved Items</Text>
              <Text style={styles.actionSubtitle}>Your favorites</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardInfo]}
              onPress={viewScanHistory}
              disabled={isLoadingHistory}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: "#4facfe" },
                ]}
              >
                <Text style={styles.actionIcon}>
                  {isLoadingHistory ? "⏳" : "🕒"}
                </Text>
              </View>
              <Text style={styles.actionTitle}>Scan History</Text>
              <Text style={styles.actionSubtitle}>View past scans</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardGold]}
              onPress={viewPointsAndRewards}
              disabled={isLoadingPoints}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: "#ffeaa7" },
                ]}
              >
                <Text style={styles.actionIcon}>
                  {isLoadingPoints ? "⏳" : "🏆"}
                </Text>
              </View>
              <Text style={styles.actionTitle}>Points & Quiz</Text>
              <Text style={styles.actionSubtitle}>Earn rewards</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ✅ ENHANCED: Premium Ingredient Spotlight */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💡 Ingredient Spotlight</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSubtitle}>
            Discover powerful ingredients for optimal health
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.ingredientsScroll}
          >
            {healthyIngredients.map((ingredient) => (
              <TouchableOpacity
                key={ingredient.id}
                style={[
                  styles.ingredientCard,
                  { borderLeftColor: ingredient.color },
                ]}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.ingredientIconBg,
                    { backgroundColor: ingredient.color + "20" },
                  ]}
                >
                  <Text style={styles.ingredientIcon}>{ingredient.icon}</Text>
                </View>
                <View style={styles.ingredientContent}>
                  <Text style={styles.ingredientName}>{ingredient.name}</Text>
                  <Text style={styles.ingredientBenefits}>
                    {ingredient.benefits}
                  </Text>
                </View>
                <View style={styles.ingredientArrow}>
                  <Text style={styles.arrowIcon}>→</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ✅ ENHANCED: Premium News Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📰 Health & Nutrition News</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSubtitle}>
            Stay informed with the latest nutrition research
          </Text>

          {trendingNews.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.newsCard}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.newsIconContainer,
                  { backgroundColor: article.color + "20" },
                ]}
              >
                <Text style={styles.newsIcon}>{article.icon}</Text>
              </View>
              <View style={styles.newsContent}>
                <View style={styles.newsHeader}>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: article.color + "20" },
                    ]}
                  >
                    <Text
                      style={[styles.categoryText, { color: article.color }]}
                    >
                      {article.category}
                    </Text>
                  </View>
                  <Text style={styles.newsTime}>{article.time}</Text>
                </View>
                <Text style={styles.newsTitle}>{article.title}</Text>
                <Text style={styles.newsSummary}>{article.summary}</Text>
                <View style={styles.newsFooter}>
                  <Text style={styles.readTime}>📖 {article.readTime}</Text>
                  <Text style={styles.readMoreText}>Read More →</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ✅ NEW: Achievement Banner */}
        <View style={styles.achievementBanner}>
          <View style={styles.achievementContent}>
            <View style={styles.achievementIcon}>
              <Text style={styles.achievementEmoji}>🎉</Text>
            </View>
            <View style={styles.achievementText}>
              <Text style={styles.achievementTitle}>Great Progress!</Text>
              <Text style={styles.achievementDescription}>
                You've made 89% healthy choices this week. Keep it up!
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.achievementButton}>
            <Text style={styles.achievementButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Keep existing Quiz Modal */}
      {showQuizModal && (
        <Modal
          visible={showQuizModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          {/* Quiz modal content - keep existing implementation */}
        </Modal>
      )}
    </SafeAreaView>
  );
};

// ✅ ENHANCED: Professional Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // ✅ Hero Section
  heroSection: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 25,
  },
  heroContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  welcomeContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  welcomeEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "#64748b",
    lineHeight: 20,
  },
  heroImageContainer: {
    width: 60,
    height: 60,
    backgroundColor: "#f0fdf4",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  heroImageEmoji: {
    fontSize: 28,
  },

  // ✅ Stats Section
  statsSection: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  statsSectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardPrimary: {
    borderTopWidth: 3,
    borderTopColor: "#6366f1",
  },
  statCardSuccess: {
    borderTopWidth: 3,
    borderTopColor: "#10b981",
  },
  statCardWarning: {
    borderTopWidth: 3,
    borderTopColor: "#f59e0b",
  },
  statIconContainer: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: 4,
  },
  statTrend: {
    marginTop: 4,
  },
  statTrendText: {
    fontSize: 10,
    color: "#10b981",
    fontWeight: "600",
  },

  // ✅ Actions Section
  actionsSection: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: (width - 56) / 2,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 16,
  },

  // ✅ General Section Styles
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748b",
    paddingHorizontal: 20,
    marginBottom: 16,
    lineHeight: 18,
  },
  seeAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6366f1",
  },

  // ✅ Ingredients Section
  ingredientsScroll: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  ingredientCard: {
    width: 280,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  ingredientIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  ingredientIcon: {
    fontSize: 22,
  },
  ingredientContent: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  ingredientBenefits: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 16,
  },
  ingredientArrow: {
    marginLeft: 8,
  },
  arrowIcon: {
    fontSize: 16,
    color: "#94a3b8",
  },

  // ✅ News Section
  newsCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  newsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  newsIcon: {
    fontSize: 20,
  },
  newsContent: {
    flex: 1,
  },
  newsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
  },
  newsTime: {
    fontSize: 11,
    color: "#94a3b8",
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 6,
    lineHeight: 19,
  },
  newsSummary: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 17,
    marginBottom: 10,
  },
  newsFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  readTime: {
    fontSize: 11,
    color: "#94a3b8",
  },
  readMoreText: {
    fontSize: 12,
    color: "#6366f1",
    fontWeight: "600",
  },

  // ✅ Achievement Banner
  achievementBanner: {
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  achievementContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  achievementEmoji: {
    fontSize: 20,
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 16,
  },
  achievementButton: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  achievementButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6366f1",
  },

  bottomSpacing: {
    height: 20,
  },
});

export default HomeScreen;
