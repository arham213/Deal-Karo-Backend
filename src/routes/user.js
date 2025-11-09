import express from 'express';
import { validateRequest } from '../middlewares/validateRequest.js';
import { loginSchema, signupSchema, editUserSchema, userIdParamsSchema, verifyEmailSchema, forgotPasswordSchema, resetPasswordSchema, verifyResetPasswordOTPSchema, resendOTPSchema, adminSignupSchema } from '../validators/user.js';
import { GetYourSelf, Signup, VerifyEmail, Login, EditUser, DeleteUser, ResendOTP, ForgotPassword, ResetPassword, GetAllDealers, VerifyResetPasswordOTP, AdminSignup, VerifyAccount, VerifyAllAccounts, GetStats } from '../controllers/user.js';
import { resendOTPLimiter } from '../middlewares/rateLimiter.js';
import { authMiddleware } from "../middlewares/auth.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { User } from '../models/index.js';

const UserRouter = express.Router();

//Get All Users
UserRouter.get('/dealers', authMiddleware, authorizeRoles("admin"), GetAllDealers);

// Get YourSelf
UserRouter.get('/', authMiddleware, GetYourSelf);

// Get Stats
UserRouter.get('/stats', authMiddleware, authorizeRoles("admin"), GetStats)

// User Signup
UserRouter.post('/signup', validateRequest({ body: signupSchema }), Signup);

// Admin Signup
UserRouter.post('/admin/signup', validateRequest({ body: adminSignupSchema }), AdminSignup);

// Verify User Account
UserRouter.put('/verifyAccount/:userId', authMiddleware, authorizeRoles("admin"), VerifyAccount);

// Verify All User Accounts
UserRouter.put('/verifyAllAccounts', authMiddleware, authorizeRoles("admin"), VerifyAllAccounts);

// User Email Verification
UserRouter.post('/verifyEmail', validateRequest({ body: verifyEmailSchema }), VerifyEmail);

// User Resend OTP
UserRouter.post('/resendOTP', resendOTPLimiter, validateRequest({ body: resendOTPSchema }), ResendOTP);

// User Login
UserRouter.post('/signin', validateRequest({ body: loginSchema }), Login);

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