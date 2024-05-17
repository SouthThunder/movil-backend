import { extractJwtId } from "../utils/common.js";

import { getMongoModels } from "../database/mongoDB.js";


export const createMessage = async (req, res) => {
    try {
        const { Message } = getMongoModels();

        console.log('Creating message')

        const { content, chat } = req.body;
        const user1 = extractJwtId(req);

        // Save the new message
        const messages = await Message.create({
            sender: user1,
            content,
            chat
        })

        console.log('Message created')

        res.status(201).json({ message: 'Message sent!', messages });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Failed to Send message', error });
    }
}