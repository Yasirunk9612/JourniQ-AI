const User = require("../models/User");
const { getFrontendUrl, sendEmail } = require("../utils/emailService");
const { providerApprovedTemplate, providerRejectedTemplate } = require("../utils/emailTemplates");

const getPendingUsers = async (_req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["hotel_owner", "activity_provider"] },
      status: "pending",
    }).select("-password");

    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch pending users." });
  }
};

const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!["hotel_owner", "activity_provider"].includes(user.role)) {
      return res.status(400).json({ message: "Only provider accounts can be approved." });
    }

    user.status = "active";
    await user.save();
    const emailResult = await sendEmail({
      to: user.email,
      ...providerApprovedTemplate({
        name: user.name,
        role: user.role,
        loginUrl: `${getFrontendUrl()}/login/${user.role === "hotel_owner" ? "hotel-owner" : "activity-provider"}`,
      }),
    });

    return res.status(200).json({ message: "User approved successfully.", email: emailResult });
  } catch (error) {
    return res.status(500).json({ message: "Failed to approve user." });
  }
};

const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "Admin user cannot be blocked from this endpoint." });
    }

    user.status = "blocked";
    await user.save();
    if (["hotel_owner", "activity_provider"].includes(user.role)) {
      const emailResult = await sendEmail({
        to: user.email,
        ...providerRejectedTemplate({ name: user.name }),
      });
      return res.status(200).json({ message: "User blocked successfully.", email: emailResult });
    }

    return res.status(200).json({ message: "User blocked successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to block user." });
  }
};

module.exports = {
  getPendingUsers,
  approveUser,
  blockUser,
};
