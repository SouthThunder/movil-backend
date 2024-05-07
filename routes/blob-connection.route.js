import express from "express";
import multer from "multer";

import { authorize } from "../controllers/authMiddleware.js";
import { createBlobConnection, getAllBlobConnections, updateBlobConnectionById, addBlobToConnectionById, deleteBlobConnectionById, getAllBlobsInConnectionById, getBlobById } from "../controllers/blob-connection.controller.js";

const router = express.Router();

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// get all blob connections
router.get("/blob", getAllBlobConnections);

// create a new blob connection
router.post("/blob", authorize, createBlobConnection);

// update a specific blob connection by ID
router.put("/blob/:id", authorize, updateBlobConnectionById);

// Upload a Blob to a specific blob connection by ID
router.post("/blob/upload", authorize, upload.single('file'), addBlobToConnectionById);

// Get list of blobs in a specific blob connection by ID
router.get("/blob/list", authorize, getAllBlobsInConnectionById);

// get a specific blob connection by ID
router.post("/blob/transfer", authorize, getBlobById);

// delete a specific blob connection by ID
router.delete("/blob/:id", authorize, deleteBlobConnectionById);


export default router;
