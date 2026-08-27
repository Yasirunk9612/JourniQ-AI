const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    roomType: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    pricePerNight: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    amenities: { type: [String], default: [] },
    availableRooms: { type: Number, required: true, min: 0, default: 0 },
    images: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["active", "maintenance", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
