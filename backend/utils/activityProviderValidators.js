const parseArrayField = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value.split(",").map((v) => v.trim()).filter(Boolean);
  return [];
};

const experienceSchema = (body) => {
  const required = ["title", "category", "district", "price", "maxGuests"];
  const missing = required.filter((f) => body[f] === undefined || body[f] === "");
  if (missing.length > 0) {
    return { error: `Missing required fields: ${missing.join(", ")}`, value: null };
  }
  const value = {
      title: String(body.title).trim(),
      description: String(body.description || "").trim(),
      category: String(body.category).trim(),
      district: String(body.district).trim(),
      location: String(body.location || "").trim(),
      duration: String(body.duration || "").trim(),
      price: Number(body.price),
      maxGuests: Number(body.maxGuests),
      includedItems: parseArrayField(body.includedItems),
      safetyNotes: String(body.safetyNotes || "").trim(),
      status: body.status || "pending",
  };
  if (Array.isArray(body.images)) value.images = body.images;

  return { error: null, value };
};

const profileSchema = (body) => {
  if (!body.providerName || !String(body.providerName).trim()) {
    return { error: "providerName is required", value: null };
  }
  const value = {
      providerName: String(body.providerName).trim(),
      businessName: String(body.businessName || "").trim(),
      story: String(body.story || "").trim(),
      district: String(body.district || "").trim(),
      contactNumber: String(body.contactNumber || "").trim(),
      address: String(body.address || "").trim(),
      languages: parseArrayField(body.languages),
      verificationDocuments: Array.isArray(body.verificationDocuments) ? body.verificationDocuments : [],
  };
  if (Array.isArray(body.images)) value.images = body.images;

  return { error: null, value };
};

module.exports = { experienceSchema, profileSchema };
