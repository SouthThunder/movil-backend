import express from "express";
import { getChatsByUser, webSocketChat, createChat } from "../controllers/chat.controller.js";
import { authorize } from "../controllers/authMiddleware.js";

// Import socket
import expressWs from "express-ws";


// Create a new router
const router = express.Router();

expressWs(router)

// get all chats by user
router.get("/chat", authorize, getChatsByUser);

// Post a new chat
router.post("/chat", authorize, createChat);

// Chat web socket
router.ws("/chat/ws/:id", webSocketChat)


export default router