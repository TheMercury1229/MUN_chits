import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";
const app = express();
app.use(
  cors({
    origin: "/",//prod
    // origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true, // Allow cookies
  })
);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "/",//prod
    // origin:"/",
    // origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true, // Allow cookies
  },
});
const userSocketMap = {}; //{userId:socketId}
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    // Maps userId to socketId
    userSocketMap[userId] = socket.id;
  }
  // Sends event to all connected users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});
// Helper function for getting socket id of the message receiver
export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];
export { io, server, app };
