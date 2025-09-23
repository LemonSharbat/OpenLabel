import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  Modal,
  TextInput,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { authAPI } from "../services/api";

const ProfileScreen = ({ user: propUser, onLogout }) => {
  // Use props user data or fallback to mock data
  const [user, setUser] = useState(
    propUser || {
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1 234 567 8900",
      joinDate: "March 2024",
      totalScans: 1247,
      healthScore: 85,
      premium: false,
    }
  );

  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    dataSharing: true,
    autoSync: true,
    healthReminders: true,
  });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState("");
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);

  // Profile stats
  const profileStats = [
    {
      id: 1,
      title: "Products Scanned",
      value:
        user.totalScans?.toLocaleString() || user.scansCount?.toString() || "0",
      icon: "qr-code-scanner",
      color: Colors.primary,
    },
    {
      id: 2,
      title: "Health Score",
      value: `${user.healthScore || 85}/100`,
      icon: "favorite",
      color: Colors.success,
    },
    {
      id: 3,
      title: "Healthy Choices",
      value: "89%",
      icon: "trending-up",
      color: Colors.info,
    },
    {
      id: 4,
      title: "Days Active",
      value: "145",
      icon: "calendar-today",
      color: Colors.warning,
    },
  ];

  // Menu sections
  const menuSections = [
    {
      title: "Account",
      items: [
        {
          id: "edit-profile",
          title: "Edit Profile",
          icon: "person",
          action: () => handleEditProfile(),
        },
        {
          id: "subscription",
          title: "Subscription",
          icon: "card-membership",
          subtitle:
            user.premium || user.isPremium ? "Premium Active" : "Free Plan",
          action: () => handleSubscription(),
        },
        {
          id: "health-data",
          title: "Health Data",
          icon: "analytics",
          action: () => handleHealthData(),
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          id: "notifications",
          title: "Push Notifications",
          icon: "notifications",
          toggle: true,
          value: settings.notifications,
          action: (value) => handleToggleSetting("notifications", value),
        },
        {
          id: "dark-mode",
          title: "Dark Mode",
          icon: "dark-mode",
          toggle: true,
          value: settings.darkMode,
          action: (value) => handleToggleSetting("darkMode", value),
        },
        {
          id: "auto-sync",
          title: "Auto Sync Data",
          icon: "sync",
          toggle: true,
          value: settings.autoSync,
          action: (value) => handleToggleSetting("autoSync", value),
        },
        {
          id: "health-reminders",
          title: "Health Reminders",
          icon: "schedule",
          toggle: true,
          value: settings.healthReminders,
          action: (value) => handleToggleSetting("healthReminders", value),
        },
      ],
    },
    {
      title: "Support & Info",
      items: [
        {
          id: "help",
          title: "Help & Support",
          icon: "help",
          action: () => handleHelp(),
        },
        {
          id: "privacy",
          title: "Privacy Policy",
          icon: "privacy-tip",
          action: () => handlePrivacy(),
        },
        {
          id: "terms",
          title: "Terms of Service",
          icon: "description",
          action: () => handleTerms(),
        },
        {
          id: "rate",
          title: "Rate Our App",
          icon: "star",
          action: () => handleRateApp(),
        },
        {
          id: "feedback",
          title: "Send Feedback",
          icon: "feedback",
          action: () => handleFeedback(),
        },
      ],
    },
    {
      title: "Account Actions",
      items: [
        {
          id: "export",
          title: "Export Data",
          icon: "file-download",
          action: () => handleExportData(),
        },
        {
          id: "logout",
          title: "Sign Out",
          icon: "logout",
          action: () => handleLogout(),
          danger: true,
        },
        {
          id: "delete",
          title: "Delete Account",
          icon: "delete-forever",
          action: () => handleDeleteAccount(),
          danger: true,
        },
      ],
    },
  ];

  // Action handlers
  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "What would you like to edit?", [
      { text: "Name", onPress: () => openEditModal("name", user.name) },
      { text: "Email", onPress: () => openEditModal("email", user.email) },
      {
        text: "Phone",
        onPress: () => openEditModal("phone", user.phone || ""),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const openEditModal = (field, value) => {
    setEditField(field);
    setEditValue(value);
    setEditModalVisible(true);
  };

  const saveEditProfile = async () => {
    if (!editValue.trim()) {
      Alert.alert("Error", "Please enter a valid value");
      return;
    }

    setLoading(true);
    try {
      // Update profile on backend if user is from API
      if (propUser && propUser.id) {
        const result = await authAPI.updateProfile({
          [editField]: editValue.trim(),
        });

        if (result.success) {
          setUser((prev) => ({
            ...prev,
            [editField]: editValue.trim(),
          }));
          Alert.alert("Success", "Profile updated successfully!");
        } else {
          Alert.alert("Error", result.message || "Failed to update profile");
        }
      } else {
        // Local update for mock data
        setUser((prev) => ({
          ...prev,
          [editField]: editValue.trim(),
        }));
        Alert.alert("Success", "Profile updated successfully!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
      setEditModalVisible(false);
    }
  };

  const handleSubscription = () => {
    Alert.alert(
      "Subscription",
      user.premium || user.isPremium
        ? "Manage your Premium subscription"
        : "Upgrade to Premium for advanced features!",
      [
        {
          text: "View Plans",
          onPress: () => console.log("View subscription plans"),
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleHealthData = () => {
    Alert.alert(
      "Health Data",
      "View and manage your health insights and scan history.",
      [{ text: "OK" }]
    );
  };

  const handleToggleSetting = (setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const handleHelp = () => {
    Alert.alert("Help & Support", "How can we help you?", [
      { text: "FAQ", onPress: () => console.log("Open FAQ") },
      {
        text: "Contact Support",
        onPress: () => console.log("Contact support"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handlePrivacy = () => {
    Linking.openURL("https://openlabel.com/privacy");
  };

  const handleTerms = () => {
    Linking.openURL("https://openlabel.com/terms");
  };

  const handleRateApp = () => {
    Alert.alert(
      "⭐ Rate Our App",
      "Enjoying OpenLabel? Please rate us on the App Store!",
      [
        {
          text: "Rate 5 Stars ⭐",
          onPress: () =>
            Linking.openURL("https://apps.apple.com/app/openlabel"),
        },
        { text: "Later", style: "cancel" },
      ]
    );
  };

  const handleFeedback = () => {
    const subject = "OpenLabel App Feedback";
    const body =
      "Hi OpenLabel team,\n\nI have some feedback about the app:\n\n";
    Linking.openURL(
      `mailto:feedback@openlabel.com?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`
    );
  };

  const handleExportData = () => {
    Alert.alert("Export Data", "Export your scan history and health data?", [
      { text: "Export as PDF", onPress: () => console.log("Export PDF") },
      { text: "Export as CSV", onPress: () => console.log("Export CSV") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // ✅ WORKING LOGOUT FUNCTION
  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            // Call API logout to clear token from secure storage
            await authAPI.logout();

            // Call parent logout handler to reset app state
            if (onLogout) {
              onLogout();
            }
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to sign out. Please try again.");
          } finally {
            setLoading(false);
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "⚠️ Delete Account",
      "This will permanently delete your account and all data. This action cannot be undone.",
      [
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: () => console.log("Delete account"),
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, item.danger && styles.dangerMenuItem]}
      onPress={() => (item.toggle ? null : item.action())}
      activeOpacity={0.7}
      disabled={loading}
    >
      <View style={styles.menuItemLeft}>
        <View
          style={[
            styles.menuIconContainer,
            item.danger && styles.dangerIconContainer,
          ]}
        >
          <MaterialIcons
            name={item.icon}
            size={22}
            color={item.danger ? Colors.error : Colors.primary}
          />
        </View>
        <View style={styles.menuItemText}>
          <Text
            style={[styles.menuItemTitle, item.danger && styles.dangerText]}
          >
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>

      <View style={styles.menuItemRight}>
        {item.toggle ? (
          <Switch
            value={item.value}
            onValueChange={item.action}
            trackColor={{ false: Colors.border, true: Colors.primary + "50" }}
            thumbColor={item.value ? Colors.primary : Colors.textLight}
            disabled={loading}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
        )}
      </View>
    </TouchableOpacity>
  );

  // Show loading overlay when logging out
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Signing out...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => console.log("Settings")}>
          <MaterialIcons name="settings" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.name || "User"
                )}&background=667eea&color=fff&size=100`,
              }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraButton}>
              <MaterialIcons name="camera-alt" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.joinDate}>
              Member since{" "}
              {user.joinDate ||
                new Date(user.memberSince || Date.now()).toLocaleDateString(
                  "en-US",
                  { month: "long", year: "numeric" }
                )}
            </Text>

            {(user.premium || user.isPremium) && (
              <View style={styles.premiumBadge}>
                <MaterialIcons
                  name="workspace-premium"
                  size={16}
                  color={Colors.warning}
                />
                <Text style={styles.premiumText}>Premium Member</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Statistics</Text>
          <View style={styles.statsGrid}>
            {profileStats.map((stat) => (
              <View key={stat.id} style={styles.statCard}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: stat.color + "20" },
                  ]}
                >
                  <MaterialIcons
                    name={stat.icon}
                    size={24}
                    color={stat.color}
                  />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuContainer}>
              {section.items.map(renderMenuItem)}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>OpenLabel v1.0.0</Text>
          <Text style={styles.appInfoText}>
            Made with ❤️ for healthier choices
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit {editField}</Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                disabled={loading}
              >
                <MaterialIcons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={`Enter ${editField}`}
              autoFocus={true}
              editable={!loading}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setEditModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSaveButton,
                  loading && styles.modalSaveButtonDisabled,
                ]}
                onPress={saveEditProfile}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    margin: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.border,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  profileInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 10,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.warning + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: "600",
    marginLeft: 4,
  },
  statsContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  menuSection: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  menuContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dangerMenuItem: {
    backgroundColor: Colors.error + "05",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dangerIconContainer: {
    backgroundColor: Colors.error + "15",
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
  },
  dangerText: {
    color: Colors.error,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuItemRight: {
    marginLeft: 10,
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  appInfoText: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
    textAlign: "center",
  },
  bottomSpacing: {
    height: 100,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
    marginLeft: 10,
  },
  modalSaveButtonDisabled: {
    backgroundColor: Colors.primary + "60",
  },
  modalSaveText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
});

export default ProfileScreen;
