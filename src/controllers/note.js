import {
  createNote,
  deleteNote,
  getNoteById,
  getNotesByUserId,
  updateNote,
} from "../services/note.js";
import { successResponse } from "../utils/response.js";

export const GetNotesByUserId = async (req, res, next) => {
  console.log("GetNotesByUserId called");
  try {
    const { page, limit, } = req.query;
    const result = await getNotesByUserId(page, limit, req.user.id);
    // return successResponse(res, "Notes fetched successfully", { notes }, 200);
    return successResponse(
      res,
      "Properties fetched successfully",
      {
        notes: result.notes,
        pagination: result.pagination,
      },
      200
    );
  } catch (error) {
    next(error);
  }
};

export const GetNoteById = async (req, res, next) => {
  try {
    const note = await getNoteById(req.params.noteId);
    return successResponse(res, "Note fetched successfully", { note }, 200);
  } catch (error) {
    next(error);
  }
};

export const CreateNote = async (req, res, next) => {
  try {
    const note = await createNote(req.body, req.user.id);
    return successResponse(res, "Note created successfully", { note }, 201);
  } catch (error) {
    next(error);
  }
};

export const UpdateNote = async (req, res, next) => {
  try {
    const note = await updateNote(req.body);
    return successResponse(res, "Note updated successfully", { note }, 200);
  } catch (error) {
    next(error);
  }
};

export const DeleteNote = async (req, res, next) => {
  try {
    const note = await deleteNote(req.params.noteId);
    return successResponse(res, "Note deleted successfully", { note }, 200);
  } catch (error) {
    next(error);
  }
};