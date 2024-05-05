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
  profile_picture: {
    type: String,
    required: false
  },
  cc: {
    type: String,
    required: true,
    unique: true
  },
  latitude: {
    type: String,
    required: false
  },
  longitude: {
    type: String,
    required: false
  },
  available: {
    type: Boolean,
    default: true
  }
});

export default User;