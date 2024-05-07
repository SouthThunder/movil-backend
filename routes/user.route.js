import express from "express";
import { getUsers, getUserByCreds, createUser, auth, verifyUser, updateOAuth, verifyOAuth, updatePassword, watchUserAvailability, getUsersOnAvailability, changeUserAvailability, updateUserLocation } from "../controllers/user.controller.js";
import { authorize } from "../controllers/authMiddleware.js";
import expressWs from "express-ws";

const router = express.Router();

expressWs(router)

// Get
router.get('/user/all', getUsers);
router.get('/user/auth', authorize, auth)
router.get('/user/verify/:token', verifyUser);
router.get('/user/availability', getUsersOnAvailability)

// WebSocket
router.ws('/user/ws/:id', watchUserAvailability)

// Post
router.post('/user/create', createUser);
router.post('/user/login', getUserByCreds)
router.post('/user/reset-password', updateOAuth)
router.post('/user/auth-otp', verifyOAuth)
router.post('/user/update-password', updatePassword)
router.post('/user/update-password', updatePassword)



// Put
router.put('/user/availability', changeUserAvailability)
router.put('/user/location', updateUserLocation)



export default router;