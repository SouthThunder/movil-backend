import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


export const extractJwtId = (req) => {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    return decoded.id;
}