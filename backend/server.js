require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/admin/adminRoutes");
const hotelOwnerRoutes = require("./routes/hotelOwner/hotelOwnerRoutes");
const activityProviderRoutes = require("./routes/activityProvider/activityProviderRoutes");
const publicRoutes = require("./routes/public/publicRoutes");
const chatRoutes = require("./routes/chatRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { setupChatSocket } = require("./services/chatSocket");

const app = express();
connectDB();
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});
setupChatSocket(io);
app.set("io", io);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ message: "JourniQ AI API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/hotel-owner", hotelOwnerRoutes);
app.use("/api/activity-provider", activityProviderRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/chat", chatRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5008;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
