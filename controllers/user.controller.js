import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendResetPassword } from "./emails.controller.js";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
} from "../utils/hashing.js";

import { extractJwtId } from "../utils/common.js";

import { getMongoModels } from "../database/mongoDB.js";
import e from "express";

dotenv.config();

// Create a new User
export const createUser = async (req, res) => {
  try {
    const { User } = getMongoModels();

    req.body.password = await hashPassword(req.body.password);
    const user = await User.create(req.body);
    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY)
    res.status(200).json({ token: token });
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
    } else {
      const match = await verifyPassword(user.password, req.body.password);
      if (match) {
        const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY);
        res.status(200).json({ token: token });
      } else {
        res.status(404).json({ error: "Incorrect password" });
      }
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

export const watchUserAvailability = (ws, req) => {
  try {
    const { User } = getMongoModels();

    // Initialize the change stream to watch for updates in specific fields
    const changeStream = User.watch([
      {
        $match: {
          $or: [
            { operationType: 'insert' },
            { operationType: 'update' },
            { operationType: 'delete' }
          ]
        }
      }
    ], {
      fullDocument: 'updateLookup',
    });

    changeStream.on("change", data => {
      ws.send(JSON.stringify(data));
    });

    ws.on('close', () => {
      console.log('WebSocket closed. Stopping change stream.');
      changeStream.close();
    });

  } catch (error) {
    console.error('Failed to set up the change stream:', error);
    ws.close();
  }
}

export const updateUserLocation = async (req, res) => {
  try {
    const { User } = getMongoModels();

    const { latitude, longitude } = req.body;
    const id = extractJwtId(req);
    const user = await User.findByIdAndUpdate(id, { latitude: latitude, longitude: longitude });
    if (user) {
      res.status(200).json({ message: "Location updated successfully" });
    } else {
      res.status(404).json({ error: "User not found" });

    }
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update Location" });
  }
}

export const changeUserAvailability = async (req, res) => {
  try {
    const { User } = getMongoModels();

    const { available } = req.body;
    const id = extractJwtId(req);
    const user = await User.findByIdAndUpdate(id, { available: available });
    if (user) {
      res.status(200).json({ available: user.available });
    }
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update Availability" });
  }

}

export const getUsersOnAvailability = async (req, res) => {
  try {
    const { User } = getMongoModels();

    // get the id from the token
    const id = extractJwtId(req);

    // Get the users when Availability is true
    const users = await User.find({ available: true }, '_id profile_picture name lastname');

    // Exclude the user based on the id
    const filteredUsers = users.filter(user => user._id.toString() !== id);

    res.status(200).json({ users: filteredUsers });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve Users" });
  }

}

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
