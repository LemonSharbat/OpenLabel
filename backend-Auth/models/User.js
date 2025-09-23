const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    healthProfile: {
      type: String,
      enum: ["none", "diabetic", "hypertension", "vegetarian", "vegan"],
      default: "none",
    },
    scansCount: {
      type: Number,
      default: 0,
      max: 10, // Free tier limit
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    premiumExpiryDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user can scan (free tier limit)
userSchema.methods.canScan = function () {
  return this.isPremium || this.scansCount < 10;
};

// Increment scan count
userSchema.methods.incrementScan = async function () {
  if (!this.isPremium) {
    this.scansCount += 1;
    await this.save();
  }
};

module.exports = mongoose.model("User", userSchema);
