const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    hotelName: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    district: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    category: { type: String, default: "Hotel", trim: true },
    facilities: { type: [String], default: [] },
    images: { type: [String], default: [] },
    previewImage: { type: String, default: "" },
    verificationStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

hotelSchema.index({ verificationStatus: 1, updatedAt: -1 });
hotelSchema.index({ verificationStatus: 1, district: 1 });
hotelSchema.index({ verificationStatus: 1, category: 1 });

module.exports = mongoose.model("Hotel", hotelSchema);
