import express from 'express';
import { validateRequest } from '../middlewares/validateRequest.js';
import { loginSchema, signupSchema, editUserSchema, userIdParamsSchema, verifyEmailSchema, forgotPasswordSchema, resetPasswordSchema, verifyResetPasswordOTPSchema, resendOTPSchema } from '../validators/user.js';
import { GetYourSelf, Signup, VerifyEmail, Login, EditUser, DeleteUser, ResendOTP, ForgotPassword, ResetPassword, GetAllDealers, VerifyResetPasswordOTP } from '../controllers/user.js';
import { resendOTPLimiter } from '../middlewares/rateLimiter.js';
import { authMiddleware } from "../middlewares/auth.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const UserRouter = express.Router();

//Get All Users
UserRouter.get('/dealers', authMiddleware, authorizeRoles("admin"), GetAllDealers);

// Get YourSelf
UserRouter.get('/', authMiddleware, GetYourSelf);

// User Signup
UserRouter.post('/signup', validateRequest({ body: signupSchema }), Signup);

// User Email Verification
UserRouter.post('/verifyEmail', validateRequest({ body: verifyEmailSchema }), VerifyEmail);

// User Resend OTP
UserRouter.post('/resendOTP', resendOTPLimiter, validateRequest({ body: resendOTPSchema }), ResendOTP);

// User Login
UserRouter.post('/login', validateRequest({ body: loginSchema }), Login);

// User Forgot Password
UserRouter.post('/forgotPassword', validateRequest({ body: forgotPasswordSchema }), ForgotPassword);

// Verify Reset Password OTP
UserRouter.post('/verify-reset-password-otp', validateRequest({ body: verifyResetPasswordOTPSchema }), VerifyResetPasswordOTP);

// User Reset Password
UserRouter.post('/resetPassword', validateRequest({ body: resetPasswordSchema }), ResetPassword);

// Edit User
UserRouter.put('/', authMiddleware, validateRequest({ body: editUserSchema }), EditUser);

// Remove User By Id
UserRouter.delete('/:userId', authMiddleware, validateRequest({ params: userIdParamsSchema }), DeleteUser);

export default UserRouter;