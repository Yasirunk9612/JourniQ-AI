require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    await connectDB();

    const email = (process.env.ADMIN_EMAIL || "admin@journiq.ai").toLowerCase();
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin123", 12);

    await User.create({
      name: process.env.ADMIN_NAME || "JourniQ Admin",
      email,
      password: hashedPassword,
      phone: process.env.ADMIN_PHONE || "+94000000000",
      country: process.env.ADMIN_COUNTRY || "Sri Lanka",
      role: "admin",
      status: "active",
    });

    console.log("Admin seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Admin seed failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();
