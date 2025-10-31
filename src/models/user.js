import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    contactNo: {
        type: String,
        required: true,
        match: /^[0-9]{10,15}$/
    },
    estateName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isAccountVerified: {
        type: Boolean,
        required: true,
        default: false
    },
    OTP: {
        code: {
            type: String
        },
        expiryTime: {
            type: Date
        }
    },
    lastResetPasswordOTPSentAt: {
        type: Date,
        default: null
    },
    isResetPasswordOTPVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: 'String',
        enum: ['dealer', 'admin'],
        required: true
    },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
    try {
        // Hash password if modified
        if (this.isModified('password')) {
            this.password = await bcrypt.hash(this.password, 10);
        }

        // Hash OTP if modified
        if (this.isModified('OTP.code')) {
            this.OTP.code = await bcrypt.hash(this.OTP.code, 10);
        }

        next();
    } catch (error) {
        next(new Error("Failed to process user data. Please try again."))
    }
});

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;