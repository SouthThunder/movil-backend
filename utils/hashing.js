import argon2 from "argon2";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

export const hashPassword = async (password) => {
  const salt = parseInt(process.env.SALT) || crypto.randomBytes(32);
  const hashLength = parseInt(process.env.HASH_LENGTH) || 32;
  const timeCost = parseInt(process.env.TIME_COST) || 3;
  const memoryCost = parseInt(process.env.MEMORY_COST) || 4096;
  const parallelism = parseInt(process.env.PARALLELISM) || 2;

  try {
    const hash = await argon2.hash(password, {
      salt: salt,
      hashLength: hashLength,
      timeCost: timeCost,
      memoryCost: memoryCost,
      parallelism: parallelism,
    });
    return hash;
  } catch (error) {
    console.log(error);
  }
};

export const verifyPassword = async (hash, password) => {
  try {
    const match = await argon2.verify(hash, password);
    return match;
  } catch (error) {
    console.log(error);
  }
};

export const generateToken = () => {
  const token = crypto.randomBytes(3).toString("hex");
  const currentDateTime = new Date();
  currentDateTime.setMinutes(currentDateTime.getMinutes() + 15); // 15 minutes in the future

  return { code: token, expiration: currentDateTime };
};

export const verifyToken = (expiration) => {
  if(expiration > new Date()) return true;
}