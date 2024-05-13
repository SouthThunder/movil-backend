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
    enum: ['Hombre', 'Mujer', 'Otro'],
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
  latitude: {
    type: String,
    required: false
  },
  longitude: {
    type: String,
    required: false
  },

});

export default User;