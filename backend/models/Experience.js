const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    category: {
      type: String,
      enum: ["village culture", "traditional food", "surfing", "hiking", "safari", "wellness", "cycling", "camping"],
      required: true,
    },
    district: { type: String, required: true, trim: true },
    location: { type: String, default: "", trim: true },
    duration: { type: String, default: "", trim: true },
    price: { type: Number, required: true, min: 0 },
    maxGuests: { type: Number, required: true, min: 1 },
    images: { type: [String], default: [] },
    previewImage: { type: String, default: "" },
    includedItems: { type: [String], default: [] },
    safetyNotes: { type: String, default: "", trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected", "active"], default: "pending" },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    bookingsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Experience", experienceSchema);
