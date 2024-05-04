// Import necessary modules and dependencies
import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";
import { v4 as uuidv4 } from 'uuid';

// Import UTILS
import { extractJwtId } from "../utils/common.js";

// Define your controller functions
dotenv.config();

const verifyIfContainerExists = async (blobServiceClient, containerName) => {
    for await (const container of blobServiceClient.listContainers()) {
        if (container.name === containerName) {
            return true;
        }
    }
    return false;
}

// Utility function to convert stream to buffer
const streamToBuffer = async (readableStream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on('error', reject);
    });
};

// Create a new blob connection
export const createBlobConnection = async (req, res) => {
    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_BLOB_CONNECTION_STRING);
        // Search if the container already exists
        if (await verifyIfContainerExists(blobServiceClient, extractJwtId(req))) {
            return res.status(400).json({ error: 'Blob connection already exists by the name of ' + extractJwtId(req) });
        } else {
            await blobServiceClient.createContainer(extractJwtId(req));
            return res.status(201).json({ message: 'Blob connection created successfully' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all blob connections
export const getAllBlobConnections = async (req, res) => {
    try {
        // Implement the logic to get all blob connections
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_BLOB_CONNECTION_STRING);

        // List the blob containers
        for await (const container of blobServiceClient.listContainers()) {
            console.log(container.name);
        }
        res.status(200).json({ message: 'Successfully retrieved all blob connections' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
};

// Get all blobs in a specific blob connection by ID
export const getAllBlobsInConnectionById = async (req, res) => {
    try {
        // Implement the logic to get all blobs in a specific blob connection by ID
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_BLOB_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(extractJwtId(req));
        // Fill an array with all the blobs in the container
        // create an array of objects with the metadata and id of the blobs
        let blobs = [];
        for await (const blob of containerClient.listBlobsFlat()) {
            // Get The Metadata attribute 'name' from the blob
            const metadata = await containerClient.getBlobClient(blob.name).getProperties();
            blobs.push({
                id: blob.name,
                name: metadata.metadata.name
            });
        }
        res.status(200).json(blobs);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get a specific blob connection by ID
export const getBlobConnectionById = async (req, res) => {
    try {
        // Implement the logic to get a specific blob connection by ID
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_BLOB_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(extractJwtId(req));
        console.log(containerClient);

        res.status(200).json({ message: 'Successfully retrieved blob connection by ID' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update a specific blob connection by ID
export const updateBlobConnectionById = async (req, res) => {
    try {
        // Implement the logic to update a specific blob connection by ID
        const id = extractJwtId(req)
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_BLOB_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(id);
        await containerClient.setAccessPolicy('container', {
            accessPolicy: {
                expiresOn: new Date(new Date().valueOf() + 86400),
                permissions: 'rwdl'
            }
        });
        res.status(200).json({ message: 'Blob connection updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get blob object by ID
export const getBlobById = async (req, res) => {
    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_BLOB_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(extractJwtId(req)); // Make sure extractJwtId(req) correctly identifies your container
        const blobClient = containerClient.getBlobClient(req.params.id);

        const downloadBlockBlobResponse = await blobClient.download();
        const downloaded = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);

        // Optionally, you can set the content type if you know it, or use the properties from the blob
        // res.type('image/jpeg'); // Example for a JPEG image

        // It's good practice to set the appropriate status code for success operations, 200 OK is more appropriate for successful GET requests
        res.status(200).send(downloaded);
    } catch (error) {
        console.error('Error fetching blob:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Add a blob to a specific container connection by ID
export const addBlobToConnectionById = async (req, res) => {
    try {
        // Implement the logic to add a blob to a specific blob connection by ID
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_BLOB_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(extractJwtId(req));
        // Generate unique ID for the blob
        const id = uuidv4();
        const blockBlobClient = containerClient.getBlockBlobClient(id);
        const data = req.file.buffer;
        // Add name to the blob metadata
        await blockBlobClient.upload(data, data.length);
        await blockBlobClient.setMetadata({ name: req.file.originalname });
        res.status(200).json({ id: id, name: req.file.originalname });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete a specific blob connection by ID
export const deleteBlobConnectionById = async (req, res) => {
    try {
        // Implement the logic to delete a specific blob connection by ID
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_BLOB_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(extractJwtId(req));
        await containerClient.delete();
        res.status(200).json({ message: 'Blob connection deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
