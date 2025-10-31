import { createUser, verifyEmail, loginUser, editUser, resendOTP, resetPassword, sendResetPasswordOTP, getUserById, getAllDealers, verifyResetPasswordOTP } from "../services/user.js";
import { failureResponseWithData, successResponse } from "../utils/response.js";

export const GetAllDealers = async (req, res, next) => {
  try {

    console.log('Get Dealers API called');

    const dealers = await getAllDealers();

    return successResponse(res, "Dealers fetched successfully", {dealers: dealers}, 200);
  } catch (error) {
    next(error);
  }
}

export const GetUserById = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const user = await getUserById(userId);

    return successResponse(res, "User fetched successfully", {user: user}, 200);
  } catch (error) {
    next(error);
  }
}

export const GetYourSelf = async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);

    return successResponse(res, "User fetched successfully", {user: user}, 200);
  } catch (error) {
    next(error);
  }
}

export const Signup = async (req, res, next) => {
  console.log('Signup API Called');
  try {
    await createUser(req.body);

    return successResponse(res, 'Account created successfully. Please Login.', null , 201);
  } catch (error) {
    next(error);
  }
};

export const VerifyEmail = async (req, res, next) => {
  try {
    const userData = req.body;

    await verifyEmail(userData);

    return successResponse(res, 'Email verified successfully.', null , 200);
  } catch (error) {
    next(error);
  }
}

export const ResendOTP = async (req, res, next) => {
  console.log('Resend OTP API called');
  try {
    await resendOTP(req.body);

    return successResponse(res, 'OTP resent successfully. Please check your messages.', null , 200);
  } catch (error) {
    next(error);
  }
}

export const Login = async (req, res, next) => {
  try {
    const response = await loginUser(req.body);

    if (!response.success) {
      return failureResponseWithData(res, response.error, { userId: response.userId }, response.statusCode);
    }

    const data = {
      user: {
        id: response.user._id,
        email: response.user.email,
      },
      token: response.token
    }

    return successResponse(res, "User signed in successfully", data, 200);
  } catch (error) {
    next(error);
  }
}

export const ForgotPassword = async (req, res, next) => {
  try {
    const userId = await sendResetPasswordOTP(req.body.email);

    return successResponse(res, "Password reset OTP has been sent to your email.", { userId }, 200);
  } catch (error) {
    next(error);
  }
}

export const VerifyResetPasswordOTP = async (req, res, next) => {
  try {
    const userId = await verifyResetPasswordOTP(req.body);

    return successResponse(res, "OTP verified successfully",  { userId }, 200);
  } catch (error) {
    next(error);
  }
}

export const ResetPassword = async (req, res, next) => {
  try {
    await resetPassword(req.body);

    return successResponse(res, "Password reset successfully", null, 200);
  } catch (error) {
    next(error);
  }
}

export const EditUser = async (req, res, next) => {
  try {
    const user = await editUser(userData);

    return successResponse(res, 'User info updated successfully', {user: user}, 200);
  } catch (error) {
    next(error);
  }
}

export const DeleteUser = async (req, res, next) => {
  
}