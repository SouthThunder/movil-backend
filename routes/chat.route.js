import express from "express";
import { getChatsByUser } from "../controllers/chat.controller.js";
import { authorize } from "../controllers/authMiddleware.js";

// Create a new router
const router = express.Router();

// get all chats by user
router.get("/chat", authorize, getChatsByUser);