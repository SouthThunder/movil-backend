import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { extractJwtId } from "../utils/common.js";

import { getMongoModels } from "../database/mongoDB.js";


export const createMatchAndPutIfMatch = async (req, res) => {
    try {
        const { Match } = getMongoModels();
        const id = extractJwtId(req);
        const { user2 } = req.body;

        // Verify if a Match already exists
        const match = await Match.findOne({ user1: user2, user2: id });


    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}