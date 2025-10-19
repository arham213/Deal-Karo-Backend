import rateLimit from "express-rate-limit";

export const resendOTPLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3, //max 3 requests per IP per minute
    message: {
        success: false,
        error: "Too many OTP requests. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
})