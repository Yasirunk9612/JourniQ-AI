const mongoose = require("mongoose");

const communityProfileSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    providerName: { type: String, required: true, trim: true },
    businessName: { type: String, default: "", trim: true },
    story: { type: String, default: "", trim: true },
    district: { type: String, default: "", trim: true },
    contactNumber: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    languages: { type: [String], default: [] },
    verificationDocuments: { type: [String], default: [] },
    images: { type: [String], default: [] },
    previewImage: { type: String, default: "" },
    verificationStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CommunityProfile", communityProfileSchema);
