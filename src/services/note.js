import { Note } from "../models/index.js";
import { AppError } from "../utils/AppError.js";

export const getNotesByUserId = async (page = 1, limit = 10, userId) => {
    // Ensure page and limit are integers
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;
    
    // Execute query with pagination and sorting
    const notes = await Note.find({ userId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

    // Get total count for pagination
    const total = await Note.countDocuments({ userId: userId });

    return {
        notes,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
        }
    };

    return notes;
}

export const getNoteById = async (noteId) => {
    const note = await Note.findById(noteId);

    if (!note) throw new AppError("Note not found", 404);

    return note;
}

export const createNote = async (noteData, userId) => {
    const newNote = await Note.create({userId, ...noteData});

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