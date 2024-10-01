import { Schema, model } from "mongoose";

const userSchema = new Schema({
  index: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  registered: {
    type: Date,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
  eyeColor: {
    type: String,
    required: true,
  },
  favoriteFruit: {
    type: String,
    required: true,
  },
  company: {
    title: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      required: true,
    },
    location: {
      country: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
  },
  tags: {
    type: [String],
    default: [],
  },
});

const authorSchema = new Schema({
  _id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  birth_year: {
    type: Number,
    required: true,
  },
});

const bookSchema = new Schema({
  _id: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  author_id: {
    type: Number,
    ref: "Author",
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
});

const User = model("User", userSchema);
const Author = model("Author", authorSchema);
const Book = model("Book", bookSchema);

export const db = {
  User,
  Author,
  Book,
};
