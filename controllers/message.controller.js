import { extractJwtId } from "../utils/common.js";

import { getMongoModels } from "../database/mongoDB.js";


export const createMessage = async (req, res) => {
    try {
        const { Message } = getMongoModels();

        const { content } = req.body;
        const user1 = extractJwtId(req);

        // Save the new message
        const message = await Message.create({
            sender: user1,
            content
        })

        res.status(201).json({ message: 'Message sent!', message });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Failed to Send message', error });
    }
}