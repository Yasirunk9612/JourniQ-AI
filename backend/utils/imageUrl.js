const getPublicBaseUrl = (req) => {
  const configuredUrl = process.env.PUBLIC_URL || process.env.FRONTEND_URL;
  if (configuredUrl) return configuredUrl.replace(/\/+$/, "");
  return `${req.protocol}://${req.get("host")}`;
};

const normalizeImageUrl = (req, value) => {
  if (!value) return "";
  const imageUrl = String(value).trim();
  if (!imageUrl) return "";

  if (imageUrl.startsWith("/uploads/")) {
    return `${getPublicBaseUrl(req)}${imageUrl}`;
  }

  try {
    const parsed = new URL(imageUrl);
    if (["localhost", "127.0.0.1", "0.0.0.0"].includes(parsed.hostname) && parsed.pathname.startsWith("/uploads/")) {
      return `${getPublicBaseUrl(req)}${parsed.pathname}`;
    }
  } catch {
    return imageUrl;
  }

  return imageUrl;
};

const normalizeImageUrls = (req, values = []) => values.map((value) => normalizeImageUrl(req, value)).filter(Boolean);

const cloudinaryUploadUrl = (file) => {
  const url = file?.secure_url || file?.path || file?.url || "";
  return String(url).trim().replace(/^http:\/\/res\.cloudinary\.com\//, "https://res.cloudinary.com/");
};

const cloudinaryUploadUrls = (files = []) => files.map(cloudinaryUploadUrl).filter(Boolean);

module.exports = { cloudinaryUploadUrl, cloudinaryUploadUrls, normalizeImageUrl, normalizeImageUrls };
