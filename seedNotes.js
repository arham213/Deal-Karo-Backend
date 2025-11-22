// seedNotes.js
import mongoose from "mongoose";
import NoteModel from "./src/models/note.js"; // <-- update path if needed

const MONGO_URI = "mongodb://localhost:27017/deal-karo"; // change this

const userId = "69219b87c63c2a252f4a7419";

const randomDescription = () => {
  const texts = [
    "This is a sample note",
    "Reminder for the day",
    "Meeting notes",
    "Daily task added",
    "Important point",
    "Todo item",
    "Learning something new",
    "Small random thought",
    "Something to remember later",
    "Short description example"
  ];
  return texts[Math.floor(Math.random() * texts.length)];
};

async function seedNotes() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const notes = Array.from({ length: 200 }).map(() => ({
      userId,
      description: randomDescription()
    }));

    await NoteModel.insertMany(notes);
    console.log("200 Notes added successfully!");

    await mongoose.disconnect();
    console.log("Disconnected");
  } catch (error) {
    console.error("Error seeding notes:", error);
  }
}

seedNotes();