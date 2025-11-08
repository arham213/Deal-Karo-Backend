import { Note } from "../models/index.js";
import { AppError } from "../utils/AppError.js";

export const getAllNotes = async () => {
    const notes = await Note.find().sort({ createdAt: -1 });

    return notes;
}

export const getNoteById = async (noteId) => {
    const note = await Note.findById(noteId);

    if (!note) throw new AppError("Note not found", 404);

    return note;
}

export const createNote = async (noteData) => {
    const newNote = await Note.create(noteData);

    return newNote;
}

export const updateNote = async (noteData) => {
    const updatedNote = await Note.findByIdAndUpdate(
        noteData.noteId,
        noteData,
        { new: true, runValidators: true }
    )

    if (!updatedNote) throw new AppError("Note not found", 404);

    return updatedNote;
}

export const deleteNote = async (noteId) => {
    const deletedNote = await Note.findByIdAndDelete(noteId);

    if (!deletedNote) throw new AppError("Note not found", 404);

    return deletedNote;
}