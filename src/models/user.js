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
        unique: true,
    },
    contactNo: {
        type: String,
        required: true,
    },
    estateName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    verificationStatus: {
        type: String,
        required: true,
        enum: ["verified", "pending", "rejected", "revoked"],
        default: "pending"
    },
    OTP: {
        code: {
            type: String
        },
        expiryTime: {
            type: Date
        }
    },
    lastOTPSentAt: {
        type: Date,
        default: null
    },
    lastResetPasswordOTPSentAt: {
        type: Date,
        default: null
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isResetPasswordOTPVerified: {
        type: Boolean,
        default: false
    },
    onBoardingCompleted: {
        type: Boolean,
        default: false
    },
    role: {
        type: 'String',
        enum: ['dealer', 'admin'],
        required: true
    },
    deviceTokens: [{
        token: { type: String, required: true },
        platform: { type: String, enum: ['ios', 'android'], required: true },
        lastUpdated: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
    try {
        // Hash password if modified
        if (this.isModified('password')) {
            this.password = await bcrypt.hash(this.password, 10);
        }

        // Hash OTP only if it's a non-empty string
        if (this.isModified('OTP.code')) {
            const otpCode = this.OTP && this.OTP.code;
            if (otpCode && typeof otpCode === 'string' && otpCode.length > 0) {
                this.OTP.code = await bcrypt.hash(otpCode, 10);
            } else {
                // If OTP.code was cleared (null/undefined/empty), ensure it's null (or remove)
                this.OTP.code = null;
                this.OTP.expiryTime = null;
            }
        }

        next();
    } catch (error) {
        next(new Error("Failed to process user data. Please try again."));
    }
});


const UserModel = mongoose.model('User', UserSchema);

export default UserModel;