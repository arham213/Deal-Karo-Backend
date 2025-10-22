import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'done'],
        default: 'pending'
    }
}, { timestamps: true })

const NoteModel = mongoose.model('Note', NoteSchema);

export default NoteModel;