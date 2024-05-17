import express from "express";
import { createMessage } from "../controllers/message.controller.js";
import { authorize } from "../controllers/authMiddleware.js";

// Create a new router
const router = express.Router();

// Post Methods
router.post("/message", authorize, createMessage);


export default router