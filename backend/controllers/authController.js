const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getFrontendUrl, sendEmail, sendMany } = require("../utils/emailService");
const {
  verifyEmailTemplate,
  providerRegisteredTemplate,
  adminProviderRegisteredTemplate,
  passwordResetTemplate,
} = require("../utils/emailTemplates");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  delete user.password;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  return user;
};

const validRoles = ["tourist", "hotel_owner", "activity_provider"];

const cleanStringArray = (value) => (
  Array.isArray(value)
    ? value.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 30)
    : []
);

const normalizeTouristPreferences = (touristPreferences = {}) => ({
  interests: cleanStringArray(touristPreferences.interests),
  travelStyles: cleanStringArray(touristPreferences.travelStyles),
  budgets: cleanStringArray(touristPreferences.budgets),
  preferredDistricts: cleanStringArray(touristPreferences.preferredDistricts),
  activityTypes: cleanStringArray(touristPreferences.activityTypes),
  accommodationTypes: cleanStringArray(touristPreferences.accommodationTypes),
  pace: String(touristPreferences.pace || "").trim(),
});

const createRawToken = () => crypto.randomBytes(32).toString("hex");
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const setEmailVerification = (user) => {
  const token = createRawToken();
  user.emailVerificationToken = hashToken(token);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return token;
};

const queueRegistrationEmails = async (user, rawVerificationToken) => {
  const frontendUrl = getFrontendUrl();
  const verifyUrl = `${frontendUrl}/verify-email?token=${rawVerificationToken}`;

  const messages = [];
  if (user.role === "tourist") {
    const template = verifyEmailTemplate({ name: user.name, verifyUrl });
    messages.push({ to: user.email, ...template });
  }

  if (["hotel_owner", "activity_provider"].includes(user.role)) {
    const providerTemplate = providerRegisteredTemplate({
      name: user.name,
      role: user.role,
      businessName: user.businessName,
    });
    messages.push({ to: user.email, ...providerTemplate });

    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const adminTemplate = adminProviderRegisteredTemplate({ user });
      messages.push({ to: adminEmail, ...adminTemplate });
    }
  }

  await sendMany(messages);
};

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      country,
      role,
      profileImage,
      businessName,
      businessRegistrationNumber,
      district,
      activityCategory,
      touristPreferences,
    } = req.body;

    if (!name || !email || !password || !phone || !country || !role) {
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid registration role." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use." });
    }

    if (role === "hotel_owner") {
      if (!businessName || !businessRegistrationNumber || !district) {
        return res.status(400).json({ message: "Hotel owner business details are required." });
      }
    }

    if (role === "activity_provider") {
      if (!businessName || !activityCategory || !district) {
        return res.status(400).json({ message: "Activity provider business details are required." });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const status = role === "tourist" ? "active" : "pending";

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      country,
      role,
      status,
      profileImage: profileImage || "",
      businessName: businessName || "",
      businessRegistrationNumber: businessRegistrationNumber || "",
      district: district || "",
      activityCategory: activityCategory || "",
      touristPreferences: role === "tourist" ? normalizeTouristPreferences(touristPreferences) : undefined,
    });
    const rawVerificationToken = setEmailVerification(user);
    await user.save();
    await queueRegistrationEmails(user, rawVerificationToken);

    return res.status(201).json({
      message:
        status === "pending"
          ? "Registration submitted. Awaiting admin approval. We sent a confirmation email."
          : "Registration successful. We sent a verification email.",
      token: status === "active" ? generateToken(user._id) : null,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during registration." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (
      ["hotel_owner", "activity_provider"].includes(user.role) &&
      user.status === "pending"
    ) {
      return res.status(403).json({
        message: "Your account is pending admin approval.",
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ message: "Your account is blocked. Please contact support." });
    }

    return res.status(200).json({
      message: "Login successful.",
      token: generateToken(user._id),
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during login." });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const token = String(req.params.token || req.body.token || req.query.token || "").trim();
    if (!token) return res.status(400).json({ message: "Verification token is required." });

    const user = await User.findOne({
      emailVerificationToken: hashToken(token),
      emailVerificationExpires: { $gt: new Date() },
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (!user) return res.status(400).json({ message: "Verification link is invalid or expired." });

    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationToken = "";
    user.emailVerificationExpires = null;
    await user.save();

    return res.status(200).json({
      message: "Email verified successfully.",
      token: user.status === "active" ? generateToken(user._id) : null,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during email verification." });
  }
};

const resendVerification = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email }).select("+emailVerificationToken +emailVerificationExpires");
    if (!user) return res.status(200).json({ message: "If the account exists, a verification email will be sent." });
    if (user.isEmailVerified) return res.status(200).json({ message: "Email is already verified." });

    const rawVerificationToken = setEmailVerification(user);
    await user.save();
    const template = verifyEmailTemplate({
      name: user.name,
      verifyUrl: `${getFrontendUrl()}/verify-email?token=${rawVerificationToken}`,
    });
    await sendEmail({ to: user.email, ...template });

    return res.status(200).json({ message: "Verification email sent." });
  } catch (error) {
    return res.status(500).json({ message: "Could not resend verification email." });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email }).select("+passwordResetToken +passwordResetExpires");
    if (user) {
      const token = createRawToken();
      user.passwordResetToken = hashToken(token);
      user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();

      const template = passwordResetTemplate({
        name: user.name,
        resetUrl: `${getFrontendUrl()}/reset-password?token=${token}`,
      });
      await sendEmail({ to: user.email, ...template });
    }

    return res.status(200).json({ message: "If the account exists, a reset email will be sent." });
  } catch (error) {
    return res.status(500).json({ message: "Could not start password reset." });
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = String(req.params.token || req.body.token || "").trim();
    const password = String(req.body.password || "");
    if (!token || !password) return res.status(400).json({ message: "Token and password are required." });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });

    const user = await User.findOne({
      passwordResetToken: hashToken(token),
      passwordResetExpires: { $gt: new Date() },
    }).select("+password +passwordResetToken +passwordResetExpires");

    if (!user) return res.status(400).json({ message: "Password reset link is invalid or expired." });

    user.password = await bcrypt.hash(password, 12);
    user.passwordResetToken = "";
    user.passwordResetExpires = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    return res.status(500).json({ message: "Could not reset password." });
  }
};

const getCurrentUser = async (req, res) => {
  return res.status(200).json({ user: req.user });
};

const updateCurrentUser = async (req, res) => {
  const allowed = ["name", "phone", "country", "profileImage"];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });

  await req.user.save();
  return res.status(200).json({ message: "Profile updated.", user: sanitizeUser(req.user) });
};

const updateTouristPreferences = async (req, res) => {
  if (req.user.role !== "tourist") {
    return res.status(403).json({ message: "Only tourist accounts can update tourist preferences." });
  }

  req.user.touristPreferences = normalizeTouristPreferences(req.body.touristPreferences || req.body);
  await req.user.save();
  return res.status(200).json({ message: "Travel preferences saved.", user: sanitizeUser(req.user) });
};

const deleteCurrentUser = async (req, res) => {
  if (req.user.role === "admin") {
    return res.status(400).json({ message: "Admin account cannot be deleted here." });
  }

  await req.user.deleteOne();
  return res.status(200).json({ message: "Account deleted." });
};

const logout = async (_req, res) => {
  return res.status(200).json({ message: "Logout successful. Remove token on client." });
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateCurrentUser,
  updateTouristPreferences,
  deleteCurrentUser,
  logout,
  generateToken,
};
