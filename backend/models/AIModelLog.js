const mongoose = require("mongoose");

const aiModelLogSchema = new mongoose.Schema(
  {
    runBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    preferences: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    topN: { type: Number, required: true, min: 1, max: 20 },
    apiStatus: { type: String, enum: ["ok", "error"], default: "ok" },
    results: {
      type: [
        {
          entityName: { type: String, required: true },
          finalScore: { type: Number, required: true },
          contentScore: { type: Number, required: true },
          demandScore: { type: Number, required: true },
          explanation: { type: String, required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AIModelLog", aiModelLogSchema);
