import express from "express";
import { getChatsByUser, webSocketChat } from "../controllers/chat.controller.js";
import { authorize } from "../controllers/authMiddleware.js";

// Import socket
import expressWs from "express-ws";


// Create a new router
const router = express.Router();

expressWs(router)

// get all chats by user
router.get("/chat", authorize, getChatsByUser);

// Chat web socket
router.ws("/chat/ws", authorize, webSocketChat)


export default router