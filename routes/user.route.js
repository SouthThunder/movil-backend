import express from "express";
import { getUsers, getUserByCreds, createUser, auth, verifyUser, updateOAuth, verifyOAuth, updatePassword } from "../controllers/user.controller.js";
import { authorize } from "../controllers/authMiddleware.js";

const router = express.Router();

// Get
router.get('/user/all', getUsers);
router.get('/user/auth', authorize, auth)
router.get('/user/verify/:token', verifyUser);


// Post
router.post('/user/create', createUser);
router.post('/user/login', getUserByCreds)
router.post('/user/reset-password', updateOAuth)
router.post('/user/auth-otp', verifyOAuth)
router.post('/user/update-password', updatePassword)


export default router;