const mongoose = require("mongoose");

const commissionSchema = new mongoose.Schema(
  {
    sourceType: { type: String, enum: ["hotel", "activity"], required: true },
    sourceBookingId: { type: String, required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    totalAmount: { type: Number, required: true, min: 0 },
    platformCommission: { type: Number, required: true, min: 0 },
    providerEarning: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "settled"], default: "pending" },
    bookedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

commissionSchema.index({ sourceType: 1, sourceBookingId: 1 }, { unique: true });

module.exports = mongoose.model("Commission", commissionSchema);
