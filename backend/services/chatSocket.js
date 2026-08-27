const jwt = require("jsonwebtoken");
const User = require("../models/User");

const setupChatSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace("Bearer ", "");
      if (!token) return next(new Error("Authentication required."));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return next(new Error("User not found."));
      socket.user = user;
      return next();
    } catch {
      return next(new Error("Invalid token."));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.user._id}`);
    socket.emit("chat:ready", { userId: String(socket.user._id) });
  });
};

module.exports = { setupChatSocket };
