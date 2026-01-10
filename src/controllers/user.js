import { createUser, verifyEmail, loginUser, editUser, resendOTP, resetPassword, sendResetPasswordOTP, getUserById, getAllDealers, verifyResetPasswordOTP, createAdmin, verifyAccount, verifyAllAccounts, getStats, rejectAccount, deleteUser, revokeAccount } from "../services/user.js";
import { failureResponseWithData, successResponse } from "../utils/response.js";

export const GetAllDealers = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await getAllDealers(page, limit);

    return successResponse(
      res,
      "Properties fetched successfully",
      {
        dealers: result.dealers,
        pagination: result.pagination,
      },
      200
    );
  } catch (error) {
    next(error);
  }
}

export const GetUserById = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const user = await getUserById(userId);

    return successResponse(res, "User fetched successfully", { user: user }, 200);
  } catch (error) {
    next(error);
  }
}

export const GetYourSelf = async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);

    return successResponse(res, "User fetched successfully", { user: user }, 200);
  } catch (error) {
    next(error);
  }
}

export const GetStats = async (req, res, next) => {
  try {
    const stats = await getStats();

    return successResponse(res, "Stats fetched successfully", { stats }, 200);
  } catch (error) {
    next(error);
  }
}

export const Signup = async (req, res, next) => {
  try {
    const userId = await createUser(req.body);
    return successResponse(res, 'Account created successfully. Please Login.', { userId }, 201);
  } catch (error) {
    next(error);
  }
};

export const AdminSignup = async (req, res, next) => {
  try {
    await createAdmin(req.body)
    return successResponse(res, 'Account created successfully. Please Login.', null, 201);
  } catch (error) {
    next(error);
  }
}

export const VerifyAccount = async (req, res, next) => {
  try {
    await verifyAccount(req.params.userId);
    return successResponse(res, 'Account verified successfully.', 201);
  } catch (error) {
    next(error);
  }
}

export const VerifyAllAccounts = async (req, res, next) => {
  console.log('VerifyAllAccounts controller called');
  try {
    await verifyAllAccounts();
    return successResponse(res, 'All accounts verified successfully.', 201);
  } catch (error) {
    next(error);
  }
}

export const RejectAccount = async (req, res, next) => {
  try {
    await rejectAccount(req.params.userId);
    return successResponse(res, 'Account re successfully', 201);
  } catch (error) {
    next(error);
  }
}

export const RevokeAccount = async (req, res, next) => {
  try {
    await revokeAccount(req.params.userId);
    return successResponse(res, 'Account revoked successfully', 201);
  } catch (error) {
    next(error);
  }
}


export const VerifyEmail = async (req, res, next) => {
  console.log('verify email controller called');
  console.log('req.body:', req.body);
  try {
    const response = await verifyEmail(req.body);
    console.log('response from service:', response);

    const data = {
      user: response.user,
      token: response.token
    }

    return successResponse(res, 'Email verified successfully.', data, 200);
  } catch (error) {
    next(error);
  }
}

export const ResendOTP = async (req, res, next) => {
  try {
    await resendOTP(req.body);

    return successResponse(res, 'OTP resent successfully. Please check your messages.', null, 200);
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
      user: response.user,
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

    return successResponse(res, "OTP verified successfully", { userId }, 200);
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
    const user = await editUser(req.body);

    return successResponse(res, 'User info updated successfully', { user: user }, 200);
  } catch (error) {
    next(error);
  }
}

export const DeleteAccount = async (req, res, next) => {
  console.log('Delet Account API hit');
  try {
    const user = await deleteUser(req.user.id);

    return successResponse(res, 'Account deleted successfully', { user: user }, 200);
  } catch (error) {
    next(error);
  }
}

export const DeleteUser = async (req, res, next) => {
  try {
    const user = await deleteUser(req.params.userId);

    return successResponse(res, 'User deleted successfully', { user: user }, 200);
  } catch (error) {
    next(error);
  }
}

export const RegisterDeviceToken = async (req, res, next) => {
  try {
    const { deviceToken, platform } = req.body;
    const userId = req.user.id;

    const UserModel = (await import('../models/user.js')).default;

    // Find the user first
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if token already exists
    const tokenExists = user.deviceTokens.some(dt => dt.token === deviceToken);

    if (tokenExists) {
      // Update the lastUpdated timestamp for existing token
      console.log(`📱 [DEVICE_TOKEN] Token already exists for user ${user.name}, updating timestamp`);
      await UserModel.findOneAndUpdate(
        { _id: userId, 'deviceTokens.token': deviceToken },
        { $set: { 'deviceTokens.$.lastUpdated': new Date() } }
      );
    } else {
      // Add new token
      console.log(`📱 [DEVICE_TOKEN] Registering new token for user ${user.name} on ${platform}`);
      await UserModel.findByIdAndUpdate(userId, {
        $push: {
          deviceTokens: {
            token: deviceToken,
            platform,
            lastUpdated: new Date()
          }
        }
      });
    }

    return successResponse(res, "Device token registered successfully", {}, 200);
  } catch (error) {
    next(error);
  }
};

export const UnregisterDeviceToken = async (req, res, next) => {
  console.log('🔴 [DEBUG] UnregisterDeviceToken function called');
  console.log('🔴 [DEBUG] Request body:', req.body);
  console.log('🔴 [DEBUG] Request headers:', req.headers.authorization);
  console.log('🔴 [DEBUG] User from auth:', req.user);

  try {
    console.log('📱 [DEVICE_TOKEN] Unregistering device token');
    const { deviceToken } = req.body;
    const userId = req.user?.id;

    console.log('🔴 [DEBUG] Extracted deviceToken:', deviceToken);
    console.log('🔴 [DEBUG] Extracted userId:', userId);

    // Validate deviceToken exists in request
    if (!deviceToken) {
      console.log(`⚠️ [DEVICE_TOKEN] No device token provided, returning success (idempotent)`);
      return successResponse(res, "Device token unregistered successfully", {}, 200);
    }

    if (!userId) {
      console.error('❌ [DEVICE_TOKEN] No user ID found - authentication may have failed');
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const UserModel = (await import('../models/user.js')).default;

    console.log(`📱 [DEVICE_TOKEN] Unregistering token for user ${userId}`);

    // $pull is idempotent - it won't fail if token doesn't exist
    const result = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { deviceTokens: { token: deviceToken } } },
      { new: true }
    );

    if (result) {
      const remainingTokens = result.deviceTokens.length;
      console.log(`✅ [DEVICE_TOKEN] Token unregistered successfully (${remainingTokens} token(s) remaining)`);
    } else {
      console.log(`⚠️ [DEVICE_TOKEN] User not found, but returning success (idempotent)`);
    }

    // Always return success - idempotent operation
    return successResponse(res, "Device token unregistered successfully", {}, 200);
  } catch (error) {
    console.error(`❌ [DEVICE_TOKEN] Error unregistering token:`, error.message);
    console.error(`❌ [DEVICE_TOKEN] Error stack:`, error.stack);
    // Even on error, return success to prevent logout issues
    // The token removal is not critical for logout to succeed
    return successResponse(res, "Device token unregistered successfully", {}, 200);
  }
};
