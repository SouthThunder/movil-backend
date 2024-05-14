import { extractJwtId } from "../utils/common.js";

import { getMongoModels } from "../database/mongoDB.js";

export const createChat = async (req, res) => {
    try {
        const { Chat } = getMongoModels();

        const { user2 } = req.body;
        const user1 = extractJwtId(req);

        // Save the new chat
        await Chat.create({
            user1,
            user2
        });

        res.status(201).json({ message: 'Chat created!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create chat', error });
    }
}

export const getChatsByUser = async (req, res) => {
    try {
        const { Chat } = getMongoModels();

        const user1 = extractJwtId(req);

        const chats = await Chat.find({
            $or: [{ user1 }, { user2: user1 }]
        });

        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get chats', error });
    }
}