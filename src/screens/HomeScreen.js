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
  ActivityIndicator,
} from "react-native";
import { Colors } from "../constants/Colors";
import Header from "../components/common/Header";

const { width, height } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);

  // ✅ NEW: Add these missing image viewer state variables
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImageUrl, setViewerImageUrl] = useState("");
  const [viewerImageReport, setViewerImageReport] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);

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

  // Keep all your existing functions (quiz questions, viewPointsAndRewards, etc.)...
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

  // Keep all your existing functions (points, quiz, etc.)
  const viewPointsAndRewards = async () => {
    try {
      setIsLoadingPoints(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      const pointsData = {
        totalPoints: 2450,
        quizPoints: 145,
        scanPoints: 2305,
        level: "Gold",
        levelProgress: 82,
        pointsToNext: 550,
        badges: ["beginner", "learner", "expert"],
        quizzesCompleted: 12,
        averageScore: 4.3,
        weeklyGoal: 100,
        weeklyProgress: 75,
        streak: 7,
      };
      showAdvancedPointsMenu(pointsData);
    } catch (error) {
      Alert.alert("Unable to Load Points", `Error: ${error.message}`, [
        { text: "OK" },
      ]);
    } finally {
      setIsLoadingPoints(false);
    }
  };

  const showAdvancedPointsMenu = (pointsData) => {
    const badges = [
      "🌱 Nutrition Novice",
      "🔍 Label Reader",
      "🧠 Ingredient Expert",
    ];
    const earnedBadges = badges.slice(0, pointsData.badges.length);

    Alert.alert(
      "🏆 Points & Rewards Hub",
      `💰 Total Points: ${pointsData.totalPoints}
🥇 Level: ${pointsData.level} (${pointsData.levelProgress}%)
🎯 Next Level: ${pointsData.pointsToNext} points to go

🧠 Quiz Stats:
📊 Completed: ${pointsData.quizzesCompleted}
⭐ Average Score: ${pointsData.averageScore}/5
🔥 Current Streak: ${pointsData.streak} days

🏅 Earned Badges (${earnedBadges.length}):
${earnedBadges.join("\n")}

📈 Weekly Goal: ${pointsData.weeklyProgress}/${pointsData.weeklyGoal} points`,
      [
        { text: "🧩 Take Quiz", onPress: () => startQuiz() },
        { text: "🏅 View All Badges", onPress: () => showAllBadges() },
        { text: "📊 Detailed Stats", onPress: () => showQuizStats(pointsData) },
        { text: "Close" },
      ]
    );
  };

  const showAllBadges = () => {
    Alert.alert(
      "🏅 Badge Collection",
      `Your Achievement Badges:

✅ 🌱 Nutrition Novice (5 pts)
   Complete your first quiz

✅ 🔍 Label Reader (25 pts)
   Score 25 points in quizzes

✅ 🧠 Ingredient Expert (50 pts)
   Score 50 points in quizzes

🔒 🏆 Nutrition Master (100 pts)
   Score 100 points in quizzes

🔒 🌟 Perfect Scorer (5 perfect quizzes)
   Get 5/5 on five different quizzes

🔒 📚 Knowledge Guru (500 pts)
   Become the ultimate nutrition expert`,
      [{ text: "Back" }]
    );
  };

  const showQuizStats = (pointsData) => {
    Alert.alert(
      "📊 Detailed Quiz Statistics",
      `🎯 Performance Metrics:
📋 Quizzes Taken: ${pointsData.quizzesCompleted}
⭐ Average Score: ${pointsData.averageScore}/5
🎪 Best Score: 5/5 (Perfect!)
📈 Success Rate: ${Math.round((pointsData.averageScore / 5) * 100)}%
🔥 Current Streak: ${pointsData.streak} days
💡 Questions Answered: ${pointsData.quizzesCompleted * 5}

🏆 Achievements Unlocked:
• First Perfect Score: ✅
• 10+ Quiz Milestone: ✅
• Weekly Streak: ✅
• Knowledge Seeker: ✅

💪 Keep learning to unlock more badges!`,
      [
        { text: "🧩 Take Another Quiz", onPress: () => startQuiz() },
        { text: "Back" },
      ]
    );
  };

  const startQuiz = () => {
    Alert.alert(
      "🧩 Food Label Quiz",
      "Test your nutrition knowledge with real food labels!\n\n📋 5 Multiple Choice Questions\n🎯 1 Point per Correct Answer\n🏅 Earn Badges for High Scores\n⏱️ No Time Limit\n\nReady to challenge yourself?",
      [
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
      ]
    );
  };

  // Keep your existing viewScanHistory function
  const viewScanHistory = async () => {
    try {
      setIsLoadingHistory(true);
      console.log("📂 Loading enhanced scan history...");

      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/analysis/saved-reports`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      const result = await response.json();
      console.log("📂 Enhanced history result:", result);

      if (result.success) {
        if (result.reports.length === 0) {
          Alert.alert(
            "No Scan History 📝",
            "You haven't saved any ingredient analysis yet.\n\n📸 Take a photo and analyze ingredients to build your history!\n\n✨ New Features:\n• WHO health standards\n• Purchase recommendations\n• Image previews\n• Decision tracking",
            [
              {
                text: "🚀 Start Scanning",
                onPress: () => navigation?.navigate("Scan"),
              },
              { text: "OK" },
            ]
          );
        } else {
          showEnhancedScanHistory(result.reports);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("❌ History error:", error);
      Alert.alert(
        "Unable to Load History",
        `Error: ${error.message}\n\nMake sure your server is running and you have internet connection.`,
        [{ text: "OK" }]
      );
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // ✅ MODIFIED: Replace your existing showImagePreview function with this
  const showImagePreview = (imageUrl, report) => {
    console.log("Opening full image:", imageUrl);
    // Instead of showing a placeholder alert, open the full-screen viewer
    openImageViewer(report);
  };

  // ✅ NEW: Add these missing functions
  const openImageViewer = (report) => {
    const imageUrl = report.analysis?.imageUrl || report.imageInfo?.imageUrl;

    if (imageUrl) {
      console.log("🖼️ Opening full-screen image viewer for:", imageUrl);
      setViewerImageUrl(imageUrl);
      setViewerImageReport(report);
      setImageLoading(true);
      setShowImageViewer(true);
    } else {
      Alert.alert("No Image", "Image not found for this report.", [
        { text: "OK" },
      ]);
    }
  };

  const closeImageViewer = () => {
    setShowImageViewer(false);
    setViewerImageUrl("");
    setViewerImageReport(null);
    setImageLoading(true);
  };

  // Keep ALL your existing functions (saveReport, showEnhancedScanHistory, showImageGallery, etc.)
  const saveReport = async (analysisData) => {
    try {
      console.log("💾 Saving report...");

      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/analysis/save-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          data: analysisData,
          savedFrom: "mobile_app",
          deviceInfo: {
            platform: Platform.OS,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const result = await response.json();
      console.log("💾 Save result:", result);

      if (result.success) {
        Alert.alert(
          "Report Saved! 📁",
          `Your WHO health analysis has been saved successfully!\n\n📋 Report ID: ${
            result.reportId
          }\n📅 Saved at: ${new Date(
            result.savedAt
          ).toLocaleString()}\n\n🏥 This report includes:\n• WHO health standards analysis\n• Product recommendation\n• Ingredient breakdown\n• Image preview`,
          [
            {
              text: "📊 View All Reports",
              onPress: () => viewScanHistory(),
            },
            { text: "Great!" },
          ]
        );
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("❌ Save report error:", error);
      Alert.alert(
        "Save Failed ❌",
        `Failed to save report: ${error.message}\n\nPlease check your internet connection and try again.`,
        [{ text: "OK" }]
      );
    }
  };

  // Keep all your other existing functions...
  const showEnhancedScanHistory = (reports) => {
    const recentReports = reports.slice(0, 5);
    const reportsWithDecisions = reports.filter((r) => r.purchaseDecision);
    const reportsWithRecommendations = reports.filter(
      (r) => r.analysis?.productRecommendation
    );

    const followedRecommendations = reportsWithDecisions.filter((r) => {
      const recommendation = r.analysis?.productRecommendation?.recommendation;
      const decision = r.purchaseDecision?.decision;
      return (
        (recommendation === "buy" && decision === "bought") ||
        (recommendation === "avoid" && decision === "not_bought") ||
        (recommendation === "caution" && decision === "not_bought")
      );
    }).length;

    const complianceRate =
      reportsWithDecisions.length > 0
        ? Math.round(
            (followedRecommendations / reportsWithDecisions.length) * 100
          )
        : 0;

    const historyList = recentReports
      .map((report, index) => {
        const date = new Date(report.savedAt).toLocaleDateString();
        const time = new Date(report.savedAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const recommendation = report.analysis?.productRecommendation;
        const decision = report.purchaseDecision;

        let emoji = "📦";
        if (recommendation) {
          emoji =
            recommendation.recommendation === "buy"
              ? "✅"
              : recommendation.recommendation === "avoid"
              ? "❌"
              : "⚠️";
        }

        let grade = recommendation?.healthGrade || "N/A";
        let decisionEmoji = "";
        if (decision) {
          decisionEmoji = decision.decision === "bought" ? " 🛒" : " 🚫";
        }

        return `${index + 1}. ${emoji} ${date} at ${time}${decisionEmoji}
   📊 Grade: ${grade} | Score: ${
          recommendation?.summary?.overallScore || 0
        }/10`;
      })
      .join("\n\n");

    Alert.alert(
      `📋 Enhanced Scan History (${reports.length})`,
      `📊 SUMMARY:
✅ Health Compliance: ${complianceRate}%
💰 Purchase Decisions: ${reportsWithDecisions.length}/${reports.length}
🏷️ WHO Recommendations: ${reportsWithRecommendations.length}

📱 RECENT SCANS:
${historyList}

${reports.length > 5 ? `\n📝 ... and ${reports.length - 5} more reports` : ""}`,
      [
        {
          text: "🖼️ Image Gallery",
          onPress: () => showImageGallery(reports),
        },
        {
          text: "📊 Full Statistics",
          onPress: () => showAdvancedScanStats(reports),
        },
        {
          text: "📋 View Details",
          onPress: () => showDetailedHistoryList(reports),
        },
        { text: "Close" },
      ]
    );
  };

  const showImageGallery = (reports) => {
    const reportsWithImages = reports.filter(
      (report) => report.analysis?.imageUrl
    );

    if (reportsWithImages.length === 0) {
      Alert.alert("No Images", "No scan images found in your history.", [
        { text: "OK" },
      ]);
      return;
    }

    const imageOptions = reportsWithImages.slice(0, 8).map((report, index) => {
      const date = new Date(report.savedAt).toLocaleDateString();
      const recommendation = report.analysis.productRecommendation;
      const grade = recommendation?.healthGrade || "N/A";
      const emoji =
        recommendation?.recommendation === "buy"
          ? "✅"
          : recommendation?.recommendation === "avoid"
          ? "❌"
          : "⚠️";

      return {
        text: `${emoji} ${date} - Grade ${grade}`,
        onPress: () => showImagePreview(report.analysis.imageUrl, report),
      };
    });

    imageOptions.push({ text: "Cancel", style: "cancel" });

    Alert.alert(
      `🖼️ Scan Image Gallery (${reportsWithImages.length})`,
      "Select an image to view in full screen:",
      imageOptions
    );
  };

  // ✅ ADD THESE MISSING FUNCTIONS TO YOUR HOMESCREEN.JS

  // Advanced scan statistics function
  const showAdvancedScanStats = (reports) => {
    const totalScans = reports.length;
    const reportsWithRecommendations = reports.filter(
      (r) => r.analysis?.productRecommendation
    );
    const reportsWithDecisions = reports.filter((r) => r.purchaseDecision);

    const buyRecommendations = reportsWithRecommendations.filter(
      (r) => r.analysis.productRecommendation.recommendation === "buy"
    ).length;

    const avoidRecommendations = reportsWithRecommendations.filter(
      (r) => r.analysis.productRecommendation.recommendation === "avoid"
    ).length;

    const cautionRecommendations = reportsWithRecommendations.filter(
      (r) => r.analysis.productRecommendation.recommendation === "caution"
    ).length;

    // Calculate average health score
    const healthScores = reportsWithRecommendations
      .map((r) => r.analysis.productRecommendation.summary?.overallScore || 0)
      .filter((score) => score > 0);

    const averageHealthScore =
      healthScores.length > 0
        ? (
            healthScores.reduce((sum, score) => sum + score, 0) /
            healthScores.length
          ).toFixed(1)
        : 0;

    // Calculate WHO compliance rate
    const compliantDecisions = reportsWithDecisions.filter((r) => {
      const recommendation = r.analysis?.productRecommendation?.recommendation;
      const decision = r.purchaseDecision?.decision;
      return (
        (recommendation === "buy" && decision === "bought") ||
        (recommendation === "avoid" && decision === "not_bought") ||
        (recommendation === "caution" && decision === "not_bought")
      );
    }).length;

    const complianceRate =
      reportsWithDecisions.length > 0
        ? Math.round((compliantDecisions / reportsWithDecisions.length) * 100)
        : 0;

    // Grade distribution
    const gradeA = reportsWithRecommendations.filter(
      (r) => r.analysis.productRecommendation.healthGrade === "A"
    ).length;
    const gradeB = reportsWithRecommendations.filter(
      (r) => r.analysis.productRecommendation.healthGrade === "B"
    ).length;
    const gradeC = reportsWithRecommendations.filter(
      (r) => r.analysis.productRecommendation.healthGrade === "C"
    ).length;
    const gradeD = reportsWithRecommendations.filter(
      (r) => r.analysis.productRecommendation.healthGrade === "D"
    ).length;
    const gradeF = reportsWithRecommendations.filter(
      (r) => r.analysis.productRecommendation.healthGrade === "F"
    ).length;

    // Recent scans (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentScans = reports.filter(
      (r) => new Date(r.savedAt) > weekAgo
    ).length;

    const lastScanDate =
      totalScans > 0
        ? new Date(reports[0].savedAt).toLocaleDateString()
        : "Never";

    Alert.alert(
      "📊 Advanced WHO Health Analytics",
      `🔬 COMPREHENSIVE ANALYSIS:
📅 Total Scans: ${totalScans}
🏥 WHO Analyzed: ${reportsWithRecommendations.length}
📊 Average Health Score: ${averageHealthScore}/10
📅 Last Scan: ${lastScanDate}
📈 Recent Activity: ${recentScans} scans this week

🏅 WHO HEALTH GRADES:
🟢 Grade A (Excellent): ${gradeA}
🟡 Grade B (Good): ${gradeB}
🟠 Grade C (Fair): ${gradeC}
🔴 Grade D (Poor): ${gradeD}
⚫ Grade F (Avoid): ${gradeF}

💡 WHO RECOMMENDATIONS:
✅ Buy Recommended: ${buyRecommendations} (${
        Math.round(
          (buyRecommendations / reportsWithRecommendations.length) * 100
        ) || 0
      }%)
⚠️ Use Caution: ${cautionRecommendations} (${
        Math.round(
          (cautionRecommendations / reportsWithRecommendations.length) * 100
        ) || 0
      }%)
❌ Avoid Recommended: ${avoidRecommendations} (${
        Math.round(
          (avoidRecommendations / reportsWithRecommendations.length) * 100
        ) || 0
      }%)

🎯 BEHAVIORAL INSIGHTS:
💰 Purchase Decisions Made: ${reportsWithDecisions.length}/${totalScans}
✅ WHO Compliance Rate: ${complianceRate}%
🏆 Health Improvement: ${
        averageHealthScore >= 7
          ? "Excellent choices!"
          : averageHealthScore >= 5
          ? "Good progress!"
          : averageHealthScore >= 3
          ? "Keep improving!"
          : "Focus on healthier options!"
      }

📈 RECOMMENDATIONS:
${
  averageHealthScore < 5
    ? "• Focus on products with Grade A or B ratings\n• Avoid products with Grade D or F ratings\n• Check ingredient lists for WHO red flags"
    : complianceRate < 70
    ? "• Try to follow more WHO recommendations\n• Consider health impact before purchasing\n• Use scan results to guide decisions"
    : "• Excellent health awareness!\n• Continue following WHO guidelines\n• Share your knowledge with others!"
}`,
      [
        {
          text: "📈 Export Report",
          onPress: () =>
            Alert.alert(
              "Export Feature",
              "Health analytics export coming in next update!",
              [{ text: "OK" }]
            ),
        },
        {
          text: "🎯 Set Health Goals",
          onPress: () =>
            Alert.alert(
              "Goal Setting",
              "Personalized health goals feature coming soon!",
              [{ text: "OK" }]
            ),
        },
        { text: "Amazing!" },
      ]
    );
  };

  // Detailed history list function
  const showDetailedHistoryList = (reports) => {
    const options = reports.slice(0, 10).map((report, index) => {
      const date = new Date(report.savedAt).toLocaleDateString();
      const time = new Date(report.savedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const recommendation = report.analysis?.productRecommendation;
      const decision = report.purchaseDecision;

      const emoji =
        recommendation?.recommendation === "buy"
          ? "✅"
          : recommendation?.recommendation === "avoid"
          ? "❌"
          : "⚠️";
      const grade = recommendation?.healthGrade || "N/A";
      const decisionText = decision
        ? decision.decision === "bought"
          ? " 🛒"
          : " 🚫"
        : "";

      return {
        text: `${emoji} ${date} ${time} - Grade ${grade}${decisionText}`,
        onPress: () => showFullReportDetails(report),
      };
    });

    options.push({ text: "Cancel", style: "cancel" });

    Alert.alert(
      `📋 Detailed Scan List (${reports.length})`,
      "Select a scan to view full WHO health analysis:",
      options
    );
  };

  // Full report details function
  const showFullReportDetails = (report) => {
    const analysis = report.analysis;
    const recommendation = analysis?.productRecommendation;
    const decision = report.purchaseDecision;

    Alert.alert(
      "📋 Scan Report Options",
      `📅 Date: ${new Date(report.savedAt).toLocaleString()}
🏥 WHO Grade: ${recommendation?.healthGrade || "N/A"}
📊 Score: ${recommendation?.summary?.overallScore || 0}/10
🧾 Ingredients: ${analysis?.totalIngredients || 0}

${
  decision
    ? `💰 Decision: ${
        decision.decision === "bought" ? "Purchased 🛒" : "Not Purchased 🚫"
      }`
    : "💰 No purchase decision recorded"
}`,
      [
        {
          text: "🖼️ View Image",
          onPress: () => openImageViewer(report),
        },
        {
          text: "📊 Full Analysis",
          onPress: () => openFullAnalysisModal(report),
        },
        {
          text: "💰 Update Decision",
          onPress: () => showPurchaseDecisionUpdate(report),
        },
        { text: "Back" },
      ]
    );
  };

  // Purchase decision update function
  const showPurchaseDecisionUpdate = (report) => {
    const currentDecision = report.purchaseDecision?.decision;
    const recommendation = report.analysis?.productRecommendation;

    Alert.alert(
      "💰 Update Purchase Decision",
      `Current decision: ${
        currentDecision
          ? currentDecision === "bought"
            ? "🛒 Purchased"
            : "🚫 Not Purchased"
          : "None recorded"
      }
    
WHO Recommendation: ${recommendation?.buyAdvice || "No recommendation"}

What would you like to update it to?`,
      [
        {
          text: "✅ I Bought It",
          onPress: () => updatePurchaseDecision(report, "bought"),
        },
        {
          text: "❌ I Didn't Buy",
          onPress: () => updatePurchaseDecision(report, "not_bought"),
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  // Update purchase decision function
  const updatePurchaseDecision = async (report, decision) => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(
        `${backendUrl}/api/analysis/save-purchase-decision`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            reportId: report.id,
            decision: decision,
            notes: "",
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        const recommendation =
          report.analysis?.productRecommendation?.recommendation;
        const isGoodChoice =
          (decision === "bought" && recommendation === "buy") ||
          (decision === "not_bought" && recommendation === "avoid");

        let message = "";
        if (decision === "bought") {
          message = isGoodChoice
            ? "✅ Excellent choice! You followed the WHO health recommendation."
            : "⚠️ Purchase noted. Be mindful of the WHO health concerns identified.";
        } else {
          message = isGoodChoice
            ? "👏 Smart decision! You avoided a product with WHO health concerns."
            : "📝 Decision noted. Consider the missed healthy benefits next time.";
        }

        Alert.alert(
          "💰 Decision Updated!",
          `${message}\n\n📊 Your decisions help improve our WHO-based recommendations for you.\n\n🏥 WHO Compliance: ${
            isGoodChoice
              ? "Following guidelines ✅"
              : "Consider health impact ⚠️"
          }`,
          [{ text: "Perfect!" }]
        );
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      Alert.alert("Update Failed", `Error: ${error.message}`, [{ text: "OK" }]);
    }
  };

  // Keep all your other existing functions (showAdvancedScanStats, etc.)...

  const searchProducts = () => {
    Alert.alert(
      "🔍 Smart Product Search",
      "Search our database of 500,000+ products with WHO health ratings!\n\n🆕 Features:\n• Barcode scanning\n• Ingredient filtering\n• Health grade sorting\n• Alternative suggestions\n• Price comparison\n\nComing in the next update!",
      [
        {
          text: "🚀 Notify Me",
          onPress: () =>
            Alert.alert(
              "Notification Set",
              "We'll notify you when this feature is available!"
            ),
        },
      ]
    );
  };

  const viewSavedItems = () => {
    Alert.alert(
      "⭐ Your Favorite Products",
      "Save and organize your favorite healthy products!\n\n🆕 Features:\n• Personal favorites list\n• Custom categories\n• Shopping reminders\n• Health tracking\n• Share with friends\n\nComing in the next update!",
      [
        {
          text: "🚀 Notify Me",
          onPress: () =>
            Alert.alert(
              "Notification Set",
              "We'll notify you when this feature is available!"
            ),
        },
      ]
    );
  };

  // Keep all your existing data and quiz functions...
  const healthyIngredients = [
    {
      id: 1,
      name: "Organic Oats",
      benefits:
        "Rich in beta-glucan fiber, supports heart health & cholesterol",
      icon: "🌾",
      color: "#4CAF50",
      whoRating: "A+",
    },
    {
      id: 2,
      name: "Live Probiotics",
      benefits: "Enhances gut microbiome, boosts immune system function",
      icon: "🦠",
      color: "#FF9800",
      whoRating: "A",
    },
    {
      id: 3,
      name: "Green Tea Extract",
      benefits: "Powerful EGCG antioxidants, metabolism boost, brain health",
      icon: "🍃",
      color: "#8BC34A",
      whoRating: "A",
    },
    {
      id: 4,
      name: "Omega-3 DHA/EPA",
      benefits: "Essential fatty acids for brain, heart & inflammation control",
      icon: "🐟",
      color: "#2196F3",
      whoRating: "A+",
    },
    {
      id: 5,
      name: "Organic Quinoa",
      benefits: "Complete protein source with all 9 essential amino acids",
      icon: "🌰",
      color: "#795548",
      whoRating: "A",
    },
  ];

  const trendingNews = [
    {
      id: 1,
      category: "Research",
      title: "WHO Updates Global Nutrition Standards for 2025",
      summary:
        "New guidelines emphasize ultra-processed food reduction and micronutrient density",
      time: "1 hour ago",
      readTime: "4 min read",
      icon: "🥗",
      color: "#4CAF50",
      priority: "high",
    },
    {
      id: 2,
      category: "Education",
      title: "Hidden Sugars: 67 Names You Need to Recognize",
      summary:
        "Complete guide to identifying added sugars in processed foods using WHO criteria",
      time: "3 hours ago",
      readTime: "6 min read",
      icon: "🍯",
      color: "#FF9800",
      priority: "medium",
    },
    {
      id: 3,
      category: "Technology",
      title: "AI-Powered Nutrition Analysis Reaches 96% Accuracy",
      summary:
        "New machine learning models can identify harmful ingredients with medical-grade precision",
      time: "5 hours ago",
      readTime: "5 min read",
      icon: "🤖",
      color: "#9C27B0",
      priority: "high",
    },
    {
      id: 4,
      category: "Regulation",
      title: "FDA Mandates New Transparency Rules for Food Labels",
      summary:
        "Stricter requirements for allergen disclosure and nutritional accuracy take effect",
      time: "1 day ago",
      readTime: "4 min read",
      icon: "🏛️",
      color: "#2196F3",
      priority: "medium",
    },
  ];

  // Keep all your existing quiz functions...
  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) {
      Alert.alert("Please select an answer", "", [{ text: "OK" }]);
      return;
    }

    const currentQ = quizQuestions[currentQuestion];
    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    const newAnswers = [
      ...userAnswers,
      { questionId: currentQ.id, selected: selectedAnswer, correct: isCorrect },
    ];

    setUserAnswers(newAnswers);
    if (isCorrect) {
      setQuizScore((prevScore) => prevScore + 1);
    }

    Alert.alert(
      isCorrect ? "✅ Correct!" : "❌ Incorrect",
      `${currentQ.explanation}\n\n${
        isCorrect
          ? "+1 point earned!"
          : "Correct answer: " + currentQ.options[currentQ.correctAnswer]
      }`,
      [
        {
          text:
            currentQuestion < quizQuestions.length - 1
              ? "Next Question"
              : "Finish Quiz",
          onPress: () => {
            if (currentQuestion < quizQuestions.length - 1) {
              setCurrentQuestion((prev) => prev + 1);
              setSelectedAnswer(null);
            } else {
              completeQuiz(newAnswers);
            }
          },
        },
      ]
    );
  };

  const completeQuiz = (answers) => {
    setQuizCompleted(true);
    setShowQuizModal(false);

    const correctAnswers = answers.filter((answer) => answer.correct).length;
    const percentage = Math.round(
      (correctAnswers / quizQuestions.length) * 100
    );

    let badge = "";
    let badgeDescription = "";
    let pointsEarned = correctAnswers;

    if (correctAnswers === 5) {
      badge = "🏆 Perfect Score!";
      badgeDescription = "Outstanding! You're a nutrition expert!";
      pointsEarned += 5;
    } else if (correctAnswers >= 4) {
      badge = "🥇 Excellent!";
      badgeDescription = "Great knowledge of nutrition labels!";
      pointsEarned += 2;
    } else if (correctAnswers >= 3) {
      badge = "🥈 Good Work!";
      badgeDescription = "Solid understanding, keep learning!";
    } else {
      badge = "🥉 Keep Learning!";
      badgeDescription = "Practice makes perfect!";
    }

    Alert.alert(
      "🎉 Quiz Completed!",
      `${badge}

📊 Your Results:
✅ Correct: ${correctAnswers}/${quizQuestions.length}
📈 Score: ${percentage}%
🎯 Points Earned: +${pointsEarned}

${badgeDescription}

💰 New Total Points: ${2450 + pointsEarned}
🏅 Progress toward next badge!`,
      [
        {
          text: "🔄 Take Another Quiz",
          onPress: () => startQuiz(),
        },
        {
          text: "📚 Learn More",
          onPress: () => navigation?.navigate("Scan"),
        },
        { text: "Amazing!" },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Keep all your existing UI sections... */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeEmoji}>👋</Text>
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.heroTitle}>Welcome Back!</Text>
                <Text style={styles.heroSubtitle}>
                  Your journey to healthier eating continues with WHO standards
                </Text>
              </View>
            </View>
            <View style={styles.heroImageContainer}>
              <Text style={styles.heroImageEmoji}>🏥</Text>
            </View>
          </View>
        </View>

        {/* Enhanced Stats Dashboard */}
        <View style={styles.statsSection}>
          <Text style={styles.statsSectionTitle}>Your Health Journey</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.statCardPrimary]}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>📊</Text>
              </View>
              <Text style={styles.statNumber}>1,247</Text>
              <Text style={styles.statLabel}>WHO Analyzed</Text>
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

        {/* Enhanced Quick Actions */}
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
              <Text style={styles.actionTitle}>Smart Search</Text>
              <Text style={styles.actionSubtitle}>Find healthy products</Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Soon</Text>
              </View>
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
              <Text style={styles.actionTitle}>Favorites</Text>
              <Text style={styles.actionSubtitle}>Your saved items</Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Soon</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionCard,
                styles.actionCardInfo,
                isLoadingHistory && styles.actionCardDisabled,
              ]}
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
                {isLoadingHistory ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.actionIcon}>🕒</Text>
                )}
              </View>
              <Text style={styles.actionTitle}>Scan History</Text>
              <Text style={styles.actionSubtitle}>WHO analysis & images</Text>
              <View style={styles.enhancedBadge}>
                <Text style={styles.enhancedText}>Enhanced</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionCard,
                styles.actionCardGold,
                isLoadingPoints && styles.actionCardDisabled,
              ]}
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
                {isLoadingPoints ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.actionIcon}>🏆</Text>
                )}
              </View>
              <Text style={styles.actionTitle}>Points & Quiz</Text>
              <Text style={styles.actionSubtitle}>Earn rewards & badges</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Keep all your other existing sections (ingredients, news, achievement banner)... */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💡 WHO-Approved Ingredients</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSubtitle}>
            Discover ingredients with the highest WHO health ratings
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
                  <View style={styles.ingredientHeader}>
                    <Text style={styles.ingredientName}>{ingredient.name}</Text>
                    <View
                      style={[
                        styles.whoRatingBadge,
                        { backgroundColor: ingredient.color + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.whoRatingText,
                          { color: ingredient.color },
                        ]}
                      >
                        {ingredient.whoRating}
                      </Text>
                    </View>
                  </View>
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

        {/* Enhanced News Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📰 Health & Nutrition News</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSubtitle}>
            Latest research and updates from WHO, FDA, and nutrition experts
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
                  <View style={styles.newsMetadata}>
                    {article.priority === "high" && (
                      <View style={styles.priorityBadge}>
                        <Text style={styles.priorityText}>🔥</Text>
                      </View>
                    )}
                    <Text style={styles.newsTime}>{article.time}</Text>
                  </View>
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

        {/* Enhanced Achievement Banner */}
        <View style={styles.achievementBanner}>
          <View style={styles.achievementContent}>
            <View style={styles.achievementIcon}>
              <Text style={styles.achievementEmoji}>🎉</Text>
            </View>
            <View style={styles.achievementText}>
              <Text style={styles.achievementTitle}>
                WHO Health Goal Achieved!
              </Text>
              <Text style={styles.achievementDescription}>
                You've made 89% healthy choices this week following WHO
                standards. Amazing progress!
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.achievementButton}>
            <Text style={styles.achievementButtonText}>View Progress</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* ✅ NEW: Add the Full Screen Image Viewer Modal */}
      <Modal
        visible={showImageViewer}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageViewer}
      >
        <View style={styles.imageViewerOverlay}>
          <SafeAreaView style={styles.imageViewerContainer}>
            {/* Header with close button */}
            <View style={styles.imageViewerHeader}>
              <View style={styles.imageViewerHeaderInfo}>
                <Text style={styles.imageViewerTitle}>📸 Scanned Image</Text>
                {viewerImageReport && (
                  <Text style={styles.imageViewerSubtitle}>
                    {new Date(viewerImageReport.savedAt).toLocaleDateString()} •
                    Grade{" "}
                    {viewerImageReport.analysis?.productRecommendation
                      ?.healthGrade || "N/A"}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.imageViewerCloseButton}
                onPress={closeImageViewer}
              >
                <Text style={styles.imageViewerCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Image container */}
            <View style={styles.imageViewerImageContainer}>
              {imageLoading && (
                <View style={styles.imageViewerLoading}>
                  <ActivityIndicator size="large" color="#ffffff" />
                  <Text style={styles.imageViewerLoadingText}>
                    Loading image...
                  </Text>
                </View>
              )}

              <Image
                source={{ uri: viewerImageUrl }}
                style={styles.imageViewerImage}
                resizeMode="contain"
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  Alert.alert("Image Error", "Failed to load image", [
                    { text: "OK", onPress: closeImageViewer },
                  ]);
                }}
              />
            </View>

            {/* Footer with analysis info */}
            {viewerImageReport && (
              <View style={styles.imageViewerFooter}>
                <View style={styles.analysisQuickInfo}>
                  <View style={styles.analysisInfoItem}>
                    <Text style={styles.analysisInfoLabel}>Health Grade</Text>
                    <Text style={styles.analysisInfoValue}>
                      {viewerImageReport.analysis?.productRecommendation
                        ?.healthGrade || "N/A"}
                    </Text>
                  </View>

                  <View style={styles.analysisInfoItem}>
                    <Text style={styles.analysisInfoLabel}>Score</Text>
                    <Text style={styles.analysisInfoValue}>
                      {viewerImageReport.analysis?.productRecommendation
                        ?.summary?.overallScore || 0}
                      /10
                    </Text>
                  </View>

                  <View style={styles.analysisInfoItem}>
                    <Text style={styles.analysisInfoLabel}>Ingredients</Text>
                    <Text style={styles.analysisInfoValue}>
                      {viewerImageReport.analysis?.totalIngredients || 0}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.viewAnalysisButton}
                  onPress={() => {
                    closeImageViewer();
                    Alert.alert(
                      "Full Analysis",
                      "Complete WHO health analysis details would be shown here in production with all ingredient breakdowns."
                    );
                  }}
                >
                  <Text style={styles.viewAnalysisButtonText}>
                    📊 View Full Analysis
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>

      {/* Keep your existing Quiz Modal */}
      <Modal
        visible={showQuizModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.quizContainer}>
          <View style={styles.quizHeader}>
            <Text style={styles.quizTitle}>Nutrition Knowledge Quiz</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                Alert.alert("Exit Quiz?", "Your progress will be lost.", [
                  { text: "Continue Quiz", style: "cancel" },
                  { text: "Exit", onPress: () => setShowQuizModal(false) },
                ]);
              }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Question {currentQuestion + 1} of {quizQuestions.length}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      ((currentQuestion + 1) / quizQuestions.length) * 100
                    }%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.scoreText}>
              Score: {quizScore}/{currentQuestion + 1}
            </Text>
          </View>

          {!quizCompleted && quizQuestions[currentQuestion] && (
            <ScrollView style={styles.quizContent}>
              <Image
                source={{ uri: quizQuestions[currentQuestion].image }}
                style={styles.questionImage}
                resizeMode="cover"
              />

              <Text style={styles.questionText}>
                {quizQuestions[currentQuestion].question}
              </Text>

              <View style={styles.optionsContainer}>
                {quizQuestions[currentQuestion].options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      selectedAnswer === index && styles.selectedOption,
                    ]}
                    onPress={() => handleAnswerSelect(index)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedAnswer === index && styles.selectedOptionText,
                      ]}
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  selectedAnswer === null && styles.submitButtonDisabled,
                ]}
                onPress={submitAnswer}
                disabled={selectedAnswer === null}
              >
                <Text style={styles.submitButtonText}>
                  {currentQuestion < quizQuestions.length - 1
                    ? "Submit Answer"
                    : "Finish Quiz"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

// ✅ Enhanced styles with Image Viewer (add these new styles to your existing styles)
const styles = StyleSheet.create({
  // Keep ALL your existing styles...
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

  // Keep all your existing styles (hero, stats, actions, etc.)...
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

  // Keep all your other existing styles (stats, actions, etc.)
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

  // Actions Section
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
    position: "relative",
  },
  actionCardDisabled: {
    opacity: 0.7,
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
  comingSoonBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fbbf24",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  enhancedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#10b981",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  enhancedText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },

  // Keep all your other existing styles (sections, ingredients, news, achievement, quiz)...
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

  // Enhanced Ingredients Section
  ingredientsScroll: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  ingredientCard: {
    width: 320,
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
  ingredientHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
  },
  whoRatingBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  whoRatingText: {
    fontSize: 11,
    fontWeight: "700",
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

  // Enhanced News Section
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
  newsMetadata: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityBadge: {
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
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

  // Achievement Banner
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

  // ✅ NEW: Full Screen Image Viewer Styles
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
  },
  imageViewerContainer: {
    flex: 1,
  },
  imageViewerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  imageViewerHeaderInfo: {
    flex: 1,
  },
  imageViewerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  imageViewerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  imageViewerCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewerCloseText: {
    fontSize: 20,
    color: "white",
    fontWeight: "600",
  },
  imageViewerImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  imageViewerImage: {
    width: width,
    height: height * 0.6,
  },
  imageViewerLoading: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  imageViewerLoadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },
  imageViewerFooter: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  analysisQuickInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  analysisInfoItem: {
    alignItems: "center",
  },
  analysisInfoLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 4,
  },
  analysisInfoValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  viewAnalysisButton: {
    backgroundColor: "#10b981",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  viewAnalysisButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },

  // Keep all your existing quiz styles...
  quizContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  quizHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#64748b",
    fontWeight: "600",
  },
  progressContainer: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  progressText: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 8,
    textAlign: "center",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 14,
    color: "#6366f1",
    textAlign: "center",
    fontWeight: "600",
  },
  quizContent: {
    flex: 1,
    padding: 20,
  },
  questionImage: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    marginBottom: 24,
    backgroundColor: "#e2e8f0",
  },
  questionText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 24,
    lineHeight: 28,
    textAlign: "center",
  },
  optionsContainer: {
    marginBottom: 32,
  },
  optionButton: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedOption: {
    borderColor: "#10b981",
    backgroundColor: "#f0fdf4",
  },
  optionText: {
    fontSize: 16,
    color: "#1e293b",
    lineHeight: 22,
  },
  selectedOptionText: {
    color: "#10b981",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#10b981",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: "#e2e8f0",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },

  bottomSpacing: {
    height: 20,
  },
});

export default HomeScreen;
