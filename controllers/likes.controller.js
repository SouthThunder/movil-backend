import { extractJwtId } from "../utils/common.js";

import { getMongoModels } from "../database/mongoDB.js";


export const createLike = async (req, res) => {
    try {

        console.log('Creating like:', req.body)
        const { Like } = getMongoModels();

        const { user2, like } = req.body;
        const user1 = extractJwtId(req);

        // Check if like already exists
        const existingLike = await Like.findOne({
            user1,
            user2
        });

        // If like already exists, update it
        if (existingLike) {
            existingLike.like = like;
            await existingLike.save();
            res.status(200).json({ message: 'Like updated.' });
            return;
        }


        // Save the new like
        await Like.create({
            user1,
            user2,
            like
        });

        // After saving the like, check for a match
        if (like) {
            const match = await checkForMatch(user1, user2);
            if (match) {
                res.status(201).json({ message: 'Match created!', match: match });
            } else {
                res.status(200).json({ message: 'Like registered, no match found.' });
            }
        } else {
            res.status(200).json({ message: 'Like registered.' });
        }
    } catch (error) {
        console.log('Error registering like:', error);
        res.status(500).json({ message: 'Failed to register like', error });
    }
}

const checkForMatch = async (user1, user2) => {
    try {
        const { Like, Match, Chat } = getMongoModels();

        // Check if user1 likes user2
        const user1LikesUser2 = await Like.findOne({
            user1: user1,
            user2: user2,
            like: true
        });

        // Check if user2 likes user1
        const user2LikesUser1 = await Like.findOne({
            user1: user2,
            user2: user1,
            like: true
        });

        // If both likes are found, create a match
        if (user1LikesUser2 && user2LikesUser1) {
            const match = await Match.create({
                user1,
                user2
            });

            // Create a chat for the match
            await Chat.create({
                participants: [user1, user2],
            });

            console.log('Match created:', match);
            return match;
        } else {
            console.log('No match found.');
            return null;
        }
    } catch (error) {
        console.error('Error checking for matches:', error);
        throw error;
    }




}