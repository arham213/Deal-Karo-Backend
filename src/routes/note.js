import express from 'express';
import { GetAllNotes, GetNoteById, CreateNote, DeleteNote, UpdateNote } from '../controllers/note.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createNoteSchema, noteIdParamsSchema, updateNoteSchema } from '../validators/note.js';

const NoteRouter = express.Router();

// Get all Notes
NoteRouter.get('/', GetAllNotes);

// Get a single Note by ID
NoteRouter.get('/:noteId', validateRequest({ params: noteIdParamsSchema}), GetNoteById);

// Create a new Note
NoteRouter.post('/', CreateNote);

// Update a Note by ID
NoteRouter.put('/', validateRequest({ body: updateNoteSchema }), UpdateNote);

// Delete a Note by ID
NoteRouter.delete('/:noteId', validateRequest({ params: noteIdParamsSchema}), DeleteNote);

export default NoteRouter;
