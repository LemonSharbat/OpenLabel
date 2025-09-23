const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Register User
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { name, email, password, healthProfile } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      healthProfile: healthProfile || "none",
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration successful! Welcome to OpenLabel 🎉",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        healthProfile: user.healthProfile,
        scansCount: user.scansCount,
        isPremium: user.isPremium,
        canScan: user.canScan(),
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase(),
      isActive: true,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Welcome back to OpenLabel! 👋",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        healthProfile: user.healthProfile,
        scansCount: user.scansCount,
        isPremium: user.isPremium,
        canScan: user.canScan(),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};

// Get User Profile
const getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        healthProfile: user.healthProfile,
        scansCount: user.scansCount,
        isPremium: user.isPremium,
        canScan: user.canScan(),
        memberSince: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const { name, healthProfile } = req.body;
    const user = req.user;

    if (name) user.name = name.trim();
    if (healthProfile) user.healthProfile = healthProfile;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully ✅",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        healthProfile: user.healthProfile,
        scansCount: user.scansCount,
        isPremium: user.isPremium,
        canScan: user.canScan(),
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};
