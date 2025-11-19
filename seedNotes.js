// scripts/seedNotes.js
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import NoteModel from "./src/models/note.js";   // adjust path
import UserModel from "./src/models/user.js";   // adjust path

const MONGO_URI = "mongodb://localhost:27017/deal-karo";

const generateNote = (userId) => ({
  userId,
  description: faker.lorem.sentences(2),
});

const seedNotes = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected!");

    // Fetch all users so notes can reference a valid userId
    const users = await UserModel.find({}, "_id");

    if (users.length === 0) {
      console.log("No users found. Seed users first!");
      process.exit(0);
    }

    const notes = [];

    for (let i = 0; i < 100; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      notes.push(generateNote(randomUser._id));
    }

    await NoteModel.insertMany(notes);
    console.log("100 Random Notes Inserted Successfully!");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding notes:", error);
    process.exit(1);
  }
};

seedNotes();
