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
        const { Chat, User } = getMongoModels();
        const user1 = extractJwtId(req);

        // Obtener los chats donde participa el usuario
        const chats = await Chat.find({
            participants: {
                $in: [user1]
            }
        });

        // Extraer los IDs de los otros participantes
        let usersIds = chats.flatMap(chat => {
            return chat.participants.filter(participant => {
                return participant.toString() !== user1;
            });
        });

        // Obtener la información de los otros usuarios
        const users = await User.find({
            _id: {
                $in: usersIds
            }
        });

        // Construir el objeto de respuesta
        let response = chats.map(chat => {
            // Obtener los otros participantes de cada chat
            let otherUsers = chat.participants.filter(participant => participant.toString() !== user1);

            // Encontrar los detalles del usuario
            let userDetails = otherUsers.map(userId => {
                let user = users.find(u => u._id.toString() === userId.toString());
                return {
                    chatId: chat._id,
                    user: user
                };
            });

            return userDetails;
        });

        // Aplanar el array de respuesta
        response = response.flat();

        console.log(response)

        res.status(200).json({ users: response });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get chats', error });
    }
};



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
    try {
        const { Chat, Message } = getMongoModels();

        console.log('Chat WS connection established');

        const { id } = req.params;

        // Find the chat
        const chat = await Chat.findById(id);

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
            const { fullDocument } = data;
            console.log(fullDocument)
            ws.send(JSON.stringify(fullDocument));
        });
    } catch (error) {
        console.error(error)
    }
}


