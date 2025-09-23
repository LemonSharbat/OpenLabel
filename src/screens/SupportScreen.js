import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";

const SupportScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! 👋 I'm your OpenLabel support assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();
  const typingAnimation = useRef(new Animated.Value(0)).current;

  // Quick action buttons
  const quickActions = [
    { id: 1, text: "How to scan labels?", icon: "qr-code-scanner" },
    { id: 2, text: "Understanding health scores", icon: "analytics" },
    { id: 3, text: "Account issues", icon: "person" },
    { id: 4, text: "Report a bug", icon: "bug-report" },
  ];

  // FAQ responses
  const faqResponses = {
    "how to scan":
      "To scan nutrition labels:\n\n1. Tap the scan button 📷\n2. Point your camera at the nutrition label\n3. Make sure the label is clear and well-lit\n4. Wait for the analysis to complete\n5. Get your smart health recommendation!",

    "health score":
      "Our health scores are calculated based on:\n\n📊 Nutritional content (40%)\n🧪 Ingredient quality (35%)\n🏷️ Processing level (15%)\n✅ Certifications (10%)\n\nScores range from 0-100, with 80+ being excellent!",

    account:
      "For account-related issues:\n\n👤 Check your profile settings\n📧 Verify your email address\n🔄 Try logging out and back in\n📞 Contact us if problems persist\n\nNeed immediate help? Use the 'Contact Support' button below.",

    bug: "Thanks for helping us improve! 🐛\n\nTo report bugs:\n1. Describe what happened\n2. Tell us what you expected\n3. Share your device info\n4. Include screenshots if possible\n\nWe'll investigate and fix it ASAP!",
  };

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnimation.setValue(0);
    }
  }, [isTyping]);

  const generateBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    if (
      message.includes("scan") ||
      message.includes("camera") ||
      message.includes("label")
    ) {
      return faqResponses["how to scan"];
    } else if (
      message.includes("score") ||
      message.includes("health") ||
      message.includes("rating")
    ) {
      return faqResponses["health score"];
    } else if (
      message.includes("account") ||
      message.includes("login") ||
      message.includes("profile")
    ) {
      return faqResponses["account"];
    } else if (
      message.includes("bug") ||
      message.includes("error") ||
      message.includes("problem") ||
      message.includes("issue")
    ) {
      return faqResponses["bug"];
    } else if (
      message.includes("hello") ||
      message.includes("hi") ||
      message.includes("hey")
    ) {
      return "Hello! 😊 I'm here to help you with OpenLabel. What would you like to know about?";
    } else if (message.includes("thank")) {
      return "You're welcome! 🌟 Is there anything else I can help you with today?";
    } else if (message.includes("bye") || message.includes("goodbye")) {
      return "Goodbye! 👋 Feel free to reach out anytime if you need help with OpenLabel!";
    } else {
      return (
        "I understand you're asking about: \"" +
        userMessage +
        "\"\n\nI'm still learning! 🤖 For now, I can help with:\n• Scanning nutrition labels\n• Understanding health scores\n• Account issues\n• Bug reports\n\nOr contact our human support team for more help!"
      );
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: generateBotResponse(inputText),
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (action) => {
    const userMessage = {
      id: Date.now(),
      text: action.text,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      let response = "";
      switch (action.id) {
        case 1:
          response = faqResponses["how to scan"];
          break;
        case 2:
          response = faqResponses["health score"];
          break;
        case 3:
          response = faqResponses["account"];
          break;
        case 4:
          response = faqResponses["bug"];
          break;
        default:
          response = "Thanks for your question! Let me help you with that.";
      }

      const botResponse = {
        id: Date.now() + 1,
        text: response,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  // Contact Functions
  const handleCallSupport = () => {
    Alert.alert("📞 Call Support", "Choose your preferred support line:", [
      {
        text: "General Support",
        onPress: () => makePhoneCall("+919448796056"),
      },
      {
        text: "Technical Issues",
        onPress: () => makePhoneCall("+919448796056"),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const makePhoneCall = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert(
            "Phone Not Available",
            "Your device doesn't support phone calls. Please contact us via email instead.",
            [{ text: "OK" }]
          );
        }
      })
      .catch((err) => {
        console.error("Error making phone call:", err);
        Alert.alert(
          "Call Failed",
          "Unable to make phone call. Please try again.",
          [{ text: "OK" }]
        );
      });
  };

  const handleEmailSupport = () => {
    Alert.alert("📧 Email Support", "Choose the best email for your issue:", [
      {
        text: "General Questions",
        onPress: () =>
          sendEmail("abhinanda2853@gamil.com", "General Support Request"),
      },
      {
        text: "Technical Issues",
        onPress: () =>
          sendEmail("abhinanda2853@gamil.com", "Technical Support Request"),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const sendEmail = (emailAddress, subject) => {
    const deviceInfo = Platform.OS === "ios" ? "iOS Device" : "Android Device";
    const body = `Hello OpenLabel Support,\n\nIssue: [Describe your issue]\n\nDevice: ${deviceInfo}\nApp Version: 1.0.0\nDate: ${new Date().toLocaleDateString()}\n\nThanks!`;
    const emailUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    Linking.canOpenURL(emailUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(emailUrl);
        } else {
          Alert.alert(
            "Email Not Available",
            `Please email us at: ${emailAddress}`,
            [{ text: "OK" }]
          );
        }
      })
      .catch((err) => {
        Alert.alert("Email Failed", `Please email us at: ${emailAddress}`, [
          { text: "OK" },
        ]);
      });
  };

  const renderMessage = (message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isBot ? styles.botMessage : styles.userMessage,
      ]}
    >
      {message.isBot && (
        <View style={styles.botAvatar}>
          <MaterialIcons
            name="support-agent"
            size={20}
            color={Colors.primary}
          />
        </View>
      )}

      <View
        style={[
          styles.messageBubble,
          message.isBot ? styles.botBubble : styles.userBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.isBot ? styles.botText : styles.userText,
          ]}
        >
          {message.text}
        </Text>
        <Text
          style={[
            styles.timestamp,
            message.isBot ? styles.botTimestamp : styles.userTimestamp,
          ]}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.botMessage]}>
      <View style={styles.botAvatar}>
        <MaterialIcons name="support-agent" size={20} color={Colors.primary} />
      </View>
      <View style={[styles.messageBubble, styles.botBubble]}>
        <View style={styles.typingIndicator}>
          <Animated.View
            style={[
              styles.typingDot,
              {
                opacity: typingAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.typingDot,
              {
                opacity: typingAnimation.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.3, 1, 0.3],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.typingDot,
              {
                opacity: typingAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.3],
                }),
              },
            ]}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.supportIcon}>
              <MaterialIcons name="support-agent" size={24} color="white" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Support Chat</Text>
              <Text style={styles.headerSubtitle}>Always here to help</Text>
            </View>
          </View>
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.quickActionsTitle}>Quick Help</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionButton}
              onPress={() => handleQuickAction(action)}
            >
              <MaterialIcons
                name={action.icon}
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.quickActionText}>{action.text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.chatContainer}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          {isTyping && renderTypingIndicator()}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor={Colors.textLight}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim()
                ? styles.sendButtonActive
                : styles.sendButtonInactive,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isTyping}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? "white" : Colors.textLight}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Contact Options */}
      <View style={styles.contactOptions}>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleCallSupport}
          activeOpacity={0.8}
        >
          <Ionicons name="call" size={18} color={Colors.primary} />
          <Text style={styles.contactButtonText}>Call Support</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleEmailSupport}
          activeOpacity={0.8}
        >
          <Ionicons name="mail" size={18} color={Colors.primary} />
          <Text style={styles.contactButtonText}>Email Us</Text>
        </TouchableOpacity>
      </View>
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
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  supportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  onlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  quickActionsContainer: {
    backgroundColor: Colors.surface,
    paddingVertical: 15,
    paddingLeft: 20,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 10,
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary + "15",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  quickActionText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600",
    marginLeft: 6,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  botMessage: {
    justifyContent: "flex-start",
  },
  userMessage: {
    justifyContent: "flex-end",
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  messageBubble: {
    maxWidth: "75%",
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  botBubble: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
    marginLeft: "auto",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  botText: {
    color: Colors.text,
  },
  userText: {
    color: "white",
  },
  timestamp: {
    fontSize: 10,
    marginTop: 5,
  },
  botTimestamp: {
    color: Colors.textLight,
  },
  userTimestamp: {
    color: "rgba(255,255,255,0.7)",
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textLight,
    marginRight: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  sendButtonActive: {
    backgroundColor: Colors.primary,
  },
  sendButtonInactive: {
    backgroundColor: Colors.border,
  },
  contactOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: 100, // Space for tab bar
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary + "15",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  contactButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
    marginLeft: 6,
  },
});

export default SupportScreen;
