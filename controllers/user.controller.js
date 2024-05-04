import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendVerification, sendResetPassword } from "./emails.controller.js";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
} from "../utils/hashing.js";

import { getMongoModels } from "../database/mongoDB.js";

dotenv.config();

// Create a new User
export const createUser = async (req, res) => {
  try {
    const { User } = getMongoModels();

    req.body.password = await hashPassword(req.body.password);
    const user = await User.create(req.body);
    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, { expiresIn: "4h" })
    sendVerification(req, res, token);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Users
export const getUsers = async (req, res) => {
  try {
    const { User } = getMongoModels();

    const Users = await User.findAll();
    res.status(200).json(Users);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve Users" });
  }
};

// Get a single User by ID
export const getUserByCreds = async (req, res) => {
  try {
    const { User } = getMongoModels();

    const user = await User.findOne({
      email: req.body.email,
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
    } else if (user.verified) {
      const match = await verifyPassword(user.password, req.body.password);
      if (match) {
        const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
          expiresIn: "4h",
        });
        res.status(200).json({ token: token });
      } else {
        res.status(404).json({ error: "Incorrect password" });
      }
    } else {
      res.status(401).json({ error: "User not verified" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve User" });
  }
};

// authentica token
export const auth = async (req, res) => {
  try {
    const { User } = getMongoModels();

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.id, '_id email name lastname');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve User" });
  }
};

export const verifyOAuth = async (req, res) => {
  try {
    const { User } = getMongoModels();

    const { token, otp } = req.body;
    const { id } = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(id);
    if (user) {
      if (user.OAuth === otp) {
        if (verifyToken(new Date(user.OAuth_expire))) {
          res.status(200).json({ verification: true });
        } else {
          res.status(402).json({ verification: false });
        }
      } else {
        res.status(401).send("Incorrect OTP");
      }
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

// update only the OAuth token and expiration date
export const updateOAuth = async (req, res) => {
  try {
    const { User } = getMongoModels();

    const { code, expiration } = generateToken();
    const user = await User.findOneAndUpdate(
      { email: req.body.email },
      {
        OAuth: code,
        OAuth_expire: expiration,
      }
    );
    if (user) {
      resetPassword(req, res);
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { User } = getMongoModels();

    const { token, password } = req.body;
    const { id } = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
    } else {
      user.password = await hashPassword(password);
      await user.save();
      res.status(200).json({ message: "Password updated successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve User" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { User } = getMongoModels();

    const user = await User.findOne({
      email: req.body.email,
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
    } else {
      const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
        expiresIn: "4h",
      });
      sendResetPassword(req, res, token, user.OAuth);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve User" });
  }
};

// Delete a User by ID
export const deleteUser = async (req, res) => {
  const { token } = req.params;
  const { User } = getMongoModels();

  const { id } = jwt.verify(token, process.env.SECRET_KEY);
  try {
    const deleted = await User.findByIdAndDelete(id);
    if (deleted) {
      res.status(204).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete User" });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const { User } = getMongoModels();

    const { id } = jwt.verify(req.params.token, process.env.SECRET_KEY);
    const user = await User.findByIdAndUpdate(id, {
      verified: true,
    });
    if (user) {
      res.status(201).json({ message: "User verified successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};
