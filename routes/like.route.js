import express from "express";
import { createLike } from "../controllers/likes.controller.js";
import { authorize } from "../controllers/authMiddleware.js";

// Create a new router
const router = express.Router();


// Post Methods
router.post("/like", authorize, createLike);


export default router;