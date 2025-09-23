import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";

const { width } = Dimensions.get("window");

const TrackerScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  // Sample data for charts
  const healthScoreData = {
    week: [75, 82, 78, 85, 89, 92, 88],
    month: [78, 85, 89, 92],
    year: [65, 72, 78, 85, 89, 92],
  };

  const scanActivityData = {
    week: [12, 8, 15, 10, 18, 22, 14],
    month: [45, 52, 48, 65],
    year: [120, 145, 168, 192, 210, 245],
  };

  // Stats cards
  const statsCards = [
    {
      id: 1,
      title: "Health Score",
      value: "88",
      unit: "/100",
      change: "+5",
      icon: "favorite",
      color: Colors.success,
      bgColor: "#E8F5E8",
    },
    {
      id: 2,
      title: "Products Scanned",
      value: "247",
      unit: "this month",
      change: "+23",
      icon: "qr-code-scanner",
      color: Colors.primary,
      bgColor: "#E8F5E8",
    },
    {
      id: 3,
      title: "Healthy Choices",
      value: "89",
      unit: "%",
      change: "+12%",
      icon: "trending-up",
      color: Colors.info,
      bgColor: "#E3F2FD",
    },
    {
      id: 4,
      title: "Calories Saved",
      value: "2,450",
      unit: "kcal",
      change: "+340",
      icon: "local-fire-department",
      color: Colors.warning,
      bgColor: "#FFF3E0",
    },
  ];

  // Simple Line Chart Component
  const SimpleLineChart = ({ data, color, title }) => {
    const maxValue = Math.max(...data);
    const chartHeight = 120;
    const chartWidth = width - 80;
    const pointWidth = chartWidth / (data.length - 1);

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.miniChartTitle}>{title}</Text>
        <View style={[styles.simpleChart, { height: chartHeight }]}>
          {data.map((value, index) => {
            const height = (value / maxValue) * (chartHeight - 20);
            const left = index * pointWidth;

            return (
              <View key={index} style={styles.chartPointContainer}>
                {/* Connecting Line */}
                {index > 0 && (
                  <View
                    style={[
                      styles.chartLine,
                      {
                        backgroundColor: color,
                        width: pointWidth,
                        left: left - pointWidth,
                        top: chartHeight - height - 10,
                      },
                    ]}
                  />
                )}

                {/* Data Point */}
                <View
                  style={[
                    styles.chartPoint,
                    {
                      backgroundColor: color,
                      left: left - 4,
                      top: chartHeight - height - 14,
                    },
                  ]}
                />

                {/* Value Label */}
                <Text
                  style={[
                    styles.chartValue,
                    {
                      left: left - 10,
                      top: chartHeight - height - 35,
                    },
                  ]}
                >
                  {value}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // Simple Pie Chart Component
  const SimplePieChart = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    const radius = 60;

    return (
      <View style={styles.pieChartContainer}>
        <Text style={styles.miniChartTitle}>{title}</Text>
        <View style={styles.pieChart}>
          <View style={styles.pieChartCenter}>
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;
              const rotation = currentAngle;
              currentAngle += angle;

              return (
                <View
                  key={index}
                  style={[
                    styles.pieSlice,
                    {
                      backgroundColor: item.color,
                      transform: [{ rotate: `${rotation}deg` }],
                      width: radius * 2,
                      height: radius * 2,
                      borderRadius: radius,
                    },
                  ]}
                />
              );
            })}

            <View style={styles.pieChartInner}>
              <Text style={styles.pieChartTotal}>{total}</Text>
              <Text style={styles.pieChartLabel}>Total</Text>
            </View>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.pieLegend}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: item.color }]}
              />
              <Text style={styles.legendText}>
                {item.name}: {item.value}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Pie chart data
  const productCategoryData = [
    { name: "Healthy", value: 45, color: "#4CAF50" },
    { name: "Moderate", value: 30, color: "#FF9800" },
    { name: "Unhealthy", value: 15, color: "#F44336" },
    { name: "Unknown", value: 10, color: "#9E9E9E" },
  ];

  const ingredientsData = [
    { name: "Organic", value: 35, color: "#8BC34A" },
    { name: "Natural", value: 40, color: "#2196F3" },
    { name: "Processed", value: 20, color: "#FF9800" },
    { name: "Artificial", value: 5, color: "#F44336" },
  ];

  const periods = [
    { id: "week", label: "Week" },
    { id: "month", label: "Month" },
    { id: "year", label: "Year" },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Health Tracker</Text>
        <TouchableOpacity onPress={() => console.log("Export data")}>
          <MaterialIcons name="file-download" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.periodButton,
                selectedPeriod === period.id && styles.activePeriodButton,
              ]}
              onPress={() => setSelectedPeriod(period.id)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.id && styles.activePeriodButtonText,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {statsCards.map((card) => (
            <View
              key={card.id}
              style={[styles.statCard, { backgroundColor: card.bgColor }]}
            >
              <View style={styles.statCardHeader}>
                <MaterialIcons name={card.icon} size={24} color={card.color} />
                <Text style={[styles.statChange, { color: card.color }]}>
                  {card.change}
                </Text>
              </View>
              <Text style={styles.statValue}>
                {card.value}
                <Text style={styles.statUnit}>{card.unit}</Text>
              </Text>
              <Text style={styles.statTitle}>{card.title}</Text>
            </View>
          ))}
        </View>

        {/* Health Score Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>📈 Health Score Trend</Text>
          <SimpleLineChart
            data={healthScoreData[selectedPeriod]}
            color={Colors.success}
            title="Health Score Over Time"
          />
        </View>

        {/* Scan Activity Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>🔍 Scan Activity</Text>
          <SimpleLineChart
            data={scanActivityData[selectedPeriod]}
            color={Colors.secondary}
            title="Products Scanned"
          />
        </View>

        {/* Product Categories Pie Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>🥗 Product Categories</Text>
          <SimplePieChart
            data={productCategoryData}
            title="Health Distribution"
          />
        </View>

        {/* Ingredients Analysis */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>🧪 Ingredient Types</Text>
          <SimplePieChart data={ingredientsData} title="Ingredient Quality" />
        </View>

        {/* Weekly Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.chartTitle}>📊 Weekly Summary</Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>88/100</Text>
              <Text style={styles.summaryLabel}>Average Health Score</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>65</Text>
              <Text style={styles.summaryLabel}>Products Scanned</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>89%</Text>
              <Text style={styles.summaryLabel}>Healthy Choices</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>2,450</Text>
              <Text style={styles.summaryLabel}>Calories Saved</Text>
            </View>
          </View>
        </View>

        {/* Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.chartTitle}>💡 Weekly Insights</Text>

          <View style={styles.insightCard}>
            <MaterialIcons
              name="trending-up"
              size={24}
              color={Colors.success}
            />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Great Progress!</Text>
              <Text style={styles.insightText}>
                Your health score improved by 12% this week. Keep it up!
              </Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <MaterialIcons name="warning" size={24} color={Colors.warning} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Watch Sugar Intake</Text>
              <Text style={styles.insightText}>
                3 high-sugar products scanned. Try healthier alternatives!
              </Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <MaterialIcons name="lightbulb" size={24} color={Colors.info} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Tip of the Week</Text>
              <Text style={styles.insightText}>
                Scan breakfast items to improve your morning nutrition!
              </Text>
            </View>
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
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  scrollView: {
    flex: 1,
  },
  periodSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 25,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  activePeriodButton: {
    backgroundColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  activePeriodButtonText: {
    color: "white",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  statCard: {
    width: "48%",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statChange: {
    fontSize: 12,
    fontWeight: "bold",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  statUnit: {
    fontSize: 14,
    fontWeight: "normal",
    color: Colors.textSecondary,
  },
  statTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chartSection: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 15,
  },
  chartContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  miniChartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 15,
    textAlign: "center",
  },
  simpleChart: {
    position: "relative",
    width: "100%",
  },
  chartPointContainer: {
    position: "absolute",
  },
  chartPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: "absolute",
  },
  chartLine: {
    height: 2,
    position: "absolute",
  },
  chartValue: {
    fontSize: 10,
    color: Colors.textSecondary,
    position: "absolute",
    textAlign: "center",
    width: 20,
  },
  pieChartContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: "center",
  },
  pieChart: {
    marginBottom: 20,
  },
  pieChartCenter: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  pieSlice: {
    position: "absolute",
  },
  pieChartInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  pieChartTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  pieChartLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  pieLegend: {
    width: "100%",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
    color: Colors.text,
  },
  summarySection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  insightsSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  insightCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: "center",
  },
  insightContent: {
    flex: 1,
    marginLeft: 15,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default TrackerScreen;
