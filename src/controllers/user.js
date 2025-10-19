import { createUser, verifyNumber, loginUser, editUser, resendOTP, resetPassword, sendResetPasswordOTP, getUserById, getAllDealers } from "../services/user.js";
import { failureResponseWithData, successResponse } from "../utils/response.js";

export const GetAllDealers = async (req, res, next) => {
  try {

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
    const userId = req.user.id;

    const user = await getUserById(userId);

    return successResponse(res, "User fetched successfully", {user: user}, 200);
  } catch (error) {
    next(error);
  }
}

export const Signup = async (req, res, next) => {
  try {
    const userData = req.body;

    const [userId, message] = await createUser(userData);

    if (userId && message) return successResponse(res, message, {userId: userId} , 200);

    return successResponse(res, 'Account created successfully. We have sent you an OTP please verify your number.', {userId: userId} , 201);
  } catch (error) {
    next(error);
  }
};

export const VerifyNumber = async (req, res, next) => {
  try {
    const userData = req.body;

    await verifyNumber(userData);

    return successResponse(res, 'Number verified successfully.', null , 200);
  } catch (error) {
    next(error);
  }
}

export const ResendOTP = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    await resendOTP(userId);

    return successResponse(res, 'OTP resent successfully. Please check your messages.', null , 200);
  } catch (error) {
    next(error);
  }
}

export const Login = async (req, res, next) => {
  try {
    const userData = req.body;

    const response = await loginUser(userData);

    if (!response.success) {
      return failureResponseWithData(res, response.error, { userId: response.userId }, response.statusCode);
    }

    const data = {
      user: {
        id: response.user._id,
        contactNo: response.user.contactNo,
      },
      token: response.token
    }

    return successResponse(res, "User logged in successfully", data, 200);
  } catch (error) {
    next(error);
  }
}

export const ForgotPassword = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await sendResetPasswordOTP(userId);

    return successResponse(res, "Password reset OTP has been sent to your number.", null, 200);
  } catch (error) {
    next(error);
  }
}

export const ResetPassword = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const userData = req.body;

    await resetPassword(userData, userId);

    return successResponse(res, "Password reset successfully", null, 200);
  } catch (error) {
    next(error);
  }
}

export const EditUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const userData = req.body;

    const user = await editUser(userId, userData);

    return successResponse(res, 'User info updated successfully', {user: user}, 200);
  } catch (error) {
    next(error);
  }
}

export const DeleteUser = async (req, res, next) => {
  
}