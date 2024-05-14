import mongoose from "mongoose";

const User = new mongoose.Schema({
  name: {
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
  phone: {
    type: String,
    required: true
  },
  birthdate: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Hombres', 'Mujeres', 'Otro'],
    required: true
  },
  preferences: {
    type: String,
    enum: ['Hombres', 'Mujeres', 'Otro'],
    required: true
  },
  prefered_distance: {
    type: Number,
    required: true
  },
  hobbies: {
    type: Array,
    required: false
  },
  profile_picture: {
    type: Array,
    required: false
    // Max 6 pictures
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },

});

User.index({ location: "2dsphere" });

export default User;