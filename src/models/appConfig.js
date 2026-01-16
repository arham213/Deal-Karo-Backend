import mongoose from 'mongoose';

const appConfigSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    imageUrl: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: false
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

appConfigSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const AppConfig = mongoose.model('AppConfig', appConfigSchema);

export default AppConfig;
