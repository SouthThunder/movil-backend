import mongoose from "mongoose";

const User = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    required: true,
    default: false
  },
  OAuth: {
    type: String
  },
  OAuth_expire: {
    type: Date
  },
});

export default User;