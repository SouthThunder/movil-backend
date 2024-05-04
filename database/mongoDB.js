import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import Schemas
import User from '../models/user.model.js';

dotenv.config()

export const connectionMongo = () => {
    try {
        const mongo = mongoose.createConnection(process.env.MONGO_URL, {
            maxPoolSize: 100
        })
        mongo.on('connected', () => {
            console.log('Connected to MongoDB')
        })
        return mongo;
    } catch (error) {
        console.log(error)
    }
}

const models = {
    User: connectionMongo().model('User', User),
}

export const getMongoModels = () => models;