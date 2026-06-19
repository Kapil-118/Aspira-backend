const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const notificationRoutes = require("./routes/notificationRoutes");
const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use("/uploads", express.static("uploads"));
// Routes
const authRoutes = require("./routes/authRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const lostFoundRoutes = require("./routes/lostFoundRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const otpRoutes = require("./routes/otpRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const mentorApplicationRoutes = require("./routes/mentorApplicationRoutes");
const chatRoutes = require("./routes/chatRoutes");
const User = require("./models/User");
const aiRoutes = require("./routes/aiRoutes");
const aiController = require('./controllers/aiController');
const upload = require('./middleware/upload'); // Assumes you have multer setup here for file parsing

// Create the endpoint route
// Remove the old app.post line and replace it with this:
app.use('/api/ai', aiRoutes);
// Home Route
app.get("/", (req, res) => {
  res.send("Aspira API Running");
});

// API Routes
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/lostfound", lostFoundRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/connection", connectionRoutes);
app.use("/api/mentor-application", mentorApplicationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
  });

// Socket Setup
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const onlineUsers = {};

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});
app.set("io", io);
app.set("onlineUsers", onlineUsers);

io.on("connection", (socket) => {
  // User Online
  socket.on("userOnline", async (userId) => {
    onlineUsers[userId] = socket.id;

    await User.findByIdAndUpdate(userId, {
      lastSeen: new Date(),
    });

    io.emit("onlineUsers", Object.keys(onlineUsers));
  });

  // Join Conversation
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
  });

  // Send Message
  socket.on("sendMessage", (message) => {
    socket.to(message.conversationId).emit("receiveMessage", message);

    io.emit("conversationUpdated");
  });
  socket.on("messageDeleted", (data) => {
    socket.to(data.conversationId).emit("messageDeleted", data);
  });
  socket.on("typing", (data) => {
    socket.to(data.conversationId).emit("userTyping", data);
  });

  socket.on("stopTyping", (data) => {
    socket.to(data.conversationId).emit("userStoppedTyping");
  });
  socket.on("messagesSeen", () => {
    io.emit("messagesSeen");
  });

  // Disconnect
  socket.on("disconnect", async () => {
    const userId = Object.keys(onlineUsers).find(
      (key) => onlineUsers[key] === socket.id,
    );

    if (userId) {
      await User.findByIdAndUpdate(userId, {
        lastSeen: new Date(),
      });

      delete onlineUsers[userId];

      io.emit("onlineUsers", Object.keys(onlineUsers));
    }
  });
}); // <-- closes io.on("connection")

// Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
