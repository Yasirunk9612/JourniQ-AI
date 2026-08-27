const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    availableRooms: { type: Number, required: true, min: 0 },
    blocked: { type: Boolean, default: false },
    seasonalPrice: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Availability", availabilitySchema);
