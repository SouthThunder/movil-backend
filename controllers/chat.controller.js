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


export const getAllMessagesInChat = async (req, res) => {
    try {
        const { Message } = getMongoModels();

        const { chatId } = req.params;

        // Find all messages in the chat and order them by date created
        const messages = await Message.find({ chat: chatId }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get messages', error });
    }
}


export const webSocketChat = async (ws, req) => {
    const { Chat, Message } = getMongoModels();

    const user1 = extractJwtId(req);
    const { user2 } = req.body;

    // Find the chat
    const chat = await Chat.findOne({
        $or: [
            { user1, user2 },
            { user1: user2, user2: user1 }
        ]
    });

    // WS Connection for messages
    const messageStream = Message.watch([
        {
            $match: {
                $and: [
                    { 'fullDocument.chat': chat._id },
                    { 'operationType': 'insert' }
                ]
            }
        }
    ])

    // Send messages to the client
    messageStream.on('change', data => {
        ws.send(JSON.stringify(data.fullDocument));
    });
}


