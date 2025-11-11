import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    description: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        required: true,
        default: false
    }
}, { timestamps: true })

const NoteModel = mongoose.model('Note', NoteSchema);

export default NoteModel;