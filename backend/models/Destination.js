const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    district: { type: String, required: true, trim: true, maxlength: 100 },
    province: { type: String, trim: true, default: "" },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, trim: true, maxlength: 900 },
    image: { type: String, trim: true, default: "" },
    bestTime: { type: String, trim: true, default: "" },
    tags: [{ type: String, trim: true }],
    interests: [{ type: String, trim: true, index: true }],
    rating: { type: Number, default: 4.6, min: 0, max: 5 },
    status: { type: String, enum: ["draft", "published"], default: "published", index: true },
    blogTitle: { type: String, trim: true, default: "" },
    blogExcerpt: { type: String, trim: true, default: "" },
    blogHtml: { type: String, default: "" },
    blogCss: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

destinationSchema.index({ name: "text", district: "text", category: "text", tags: "text", interests: "text" });

module.exports = mongoose.model("Destination", destinationSchema);
