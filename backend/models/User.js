const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    role: {
      type: String,
      enum: ["tourist", "admin", "hotel_owner", "activity_provider"],
      default: "tourist",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "pending", "blocked"],
      default: "active",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    emailVerificationToken: {
      type: String,
      select: false,
      default: "",
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
      default: null,
    },
    passwordResetToken: {
      type: String,
      select: false,
      default: "",
    },
    passwordResetExpires: {
      type: Date,
      select: false,
      default: null,
    },
    profileImage: {
      type: String,
      default: "",
    },
    businessName: {
      type: String,
      trim: true,
      default: "",
    },
    businessRegistrationNumber: {
      type: String,
      trim: true,
      default: "",
    },
    district: {
      type: String,
      trim: true,
      default: "",
    },
    activityCategory: {
      type: String,
      trim: true,
      default: "",
    },
    touristPreferences: {
      interests: [{ type: String, trim: true }],
      travelStyles: [{ type: String, trim: true }],
      budgets: [{ type: String, trim: true }],
      preferredDistricts: [{ type: String, trim: true }],
      activityTypes: [{ type: String, trim: true }],
      accommodationTypes: [{ type: String, trim: true }],
      pace: { type: String, trim: true, default: "" },
    },
    touristBehavior: {
      recommendationSearches: [
        {
          preferences: { type: String, trim: true, default: "" },
          country: { type: String, trim: true, default: "" },
          budget: { type: String, trim: true, default: "" },
          type: { type: String, trim: true, default: "" },
          district: { type: String, trim: true, default: "" },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      tripPlannerInputs: [
        {
          destination: { type: String, trim: true, default: "" },
          startDate: { type: String, trim: true, default: "" },
          endDate: { type: String, trim: true, default: "" },
          travellers: { type: Number, default: 1 },
          budget: { type: String, trim: true, default: "" },
          interests: { type: String, trim: true, default: "" },
          pace: { type: String, trim: true, default: "" },
          accommodation: { type: String, trim: true, default: "" },
          activities: { type: String, trim: true, default: "" },
          start: { type: String, trim: true, default: "" },
          notes: { type: String, trim: true, default: "" },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      hotelBookings: { type: Number, default: 0 },
      experienceBookings: { type: Number, default: 0 },
      lastBookedDistricts: [{ type: String, trim: true }],
      lastBookedCategories: [{ type: String, trim: true }],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
