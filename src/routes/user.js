import express from 'express';
import { validateRequest } from '../middlewares/validateRequest.js';
import { loginSchema, signupSchema, editUserSchema, objectIdParamsSchema, verifyNumberSchema, resetPasswordSchema } from '../validators/user.js';
import {  GetUserById, GetYourSelf, Signup, VerifyNumber, Login, EditUser, DeleteUser, ResendOTP, ForgotPassword, ResetPassword, GetAllDealers } from '../controllers/user.js';
import { resendOTPLimiter } from '../middlewares/rateLimiter.js';
import { authMiddleware } from "../middlewares/auth.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const UserRouter = express.Router();

//Get All Users
UserRouter.get('/dealers', authMiddleware, authorizeRoles("admin"), GetAllDealers);

// Get YourSelf
UserRouter.get('/me', authMiddleware, GetYourSelf);

// User Signup
UserRouter.post('/signup', validateRequest({ body: signupSchema }), Signup);

// User Email Verification
UserRouter.post('/verifyNumber', validateRequest({ body: verifyNumberSchema }), VerifyNumber);

// User Resend OTP
UserRouter.get('/:userId/resendOTP', resendOTPLimiter, validateRequest({ params: objectIdParamsSchema }), ResendOTP);

// User Login
UserRouter.post('/login', validateRequest({ body: loginSchema }), Login);

// User Forgot Password
UserRouter.get('/forgotPassword', authMiddleware, resendOTPLimiter, ForgotPassword);

// User Reset Password
UserRouter.post('/resetPassword', authMiddleware, validateRequest({ body: resetPasswordSchema }), ResetPassword);

// Edit User
UserRouter.put('/', authMiddleware, validateRequest({ body: editUserSchema }), EditUser);

// Remove User By Id
UserRouter.delete('/:userId', authMiddleware, validateRequest({ params: objectIdParamsSchema }), DeleteUser);

export default UserRouter;