import bcrypt from "bcrypt";
import { User } from "../models/index.js";
import { generateToken } from "../utils/jwt.js";
import { generateOTP, verifyOTP } from "../utils/OTP.js";
import { sendEmail } from "../utils/emailServer.js";
import { AppError } from "../utils/AppError.js";

const OTP_EXPIRY_MIN = 10;

export const getAllDealers = async () => {
  const dealers = await User.find({ role: 'dealer' }).select("-passowrd -OTP -lastResetPasswordOTPSentAt");

  return dealers;
}

export const getUserById = async (userId) => {
  const user = await User.findById(userId).select("-password -OTP -lastResetPasswordOTPSentAt")

  if (!user) throw new AppError("User not found", 404);

  return user;
}

export const createUser = async (userData) => {
  const user = await User.findOne({ email: userData.email })

  if (user) throw new AppError("Account with this email already exists. Please Login.", 409);

  await User.create(userData);
};

export const verifyEmail = async (userData) => {
    const user = await User.findOne({_id: userData.userId});

    if (!user) throw new AppError("User not found. Please signup first.", 404);

    if (user.isEmailVerified) throw new AppError("Email already verified. Please login.", 400);

    await verifyOTP(userData.OTP, user.OTP);

    user.isEmailVerified = true;

    await user.save();
}

export const resendOTP = async (userData) => {
  console.log('userData:', userData);
  const user = await User.findById(userData.userId);

  if (!user) throw new AppError("User not found. Please signup first.", 404);

  if (userData.isSimpleOTP) {
    await generateOTPUpdateUserAndSendEmail(user, true);
  } else {
    await generateOTPUpdateUserAndSendEmail(user, false);
  }
}

export const loginUser = async (userData) => {
    const user = await User.findOne({ email: userData.email });

    if (!user) throw new AppError("Invalid email or password.", 401);

    const isPasswordCorrect = await bcrypt.compare(userData.password, user.password);

    if (!isPasswordCorrect) throw new AppError("Invalid email or password.", 401);

    const token = generateToken(user);

    const { password, OTP, lastResetPasswordOTPSentAt, isResetPasswordOTPVerified, ...userWithoutPasssword } = user.toObject();

    return { success: true, user: userWithoutPasssword, token: token };
}

export const sendResetPasswordOTP = async (email) => {
  const user = await User.findOne({ email: email });

  if (!user) throw new AppError("Account does not exists. Please signup first.", 404);

  await generateOTPUpdateUserAndSendEmail(user, false);

  return user._id;
}

export const verifyResetPasswordOTP = async (userData) => {
  const user = await User.findById(userData.userId);

  if (!user) throw new AppError("Account does not exist. Please signup first.", 404);

  if (!user.OTP) throw new AppError("Invalid or expired reset password request.", 400);

  await verifyOTP(userData.OTP, user.OTP);

  user.isResetPasswordOTPVerified = true;

  await user.save();

  return user._id;
}

export const resetPassword = async (userData) => {
  const user = await User.findById(userData.userId);

  if (!user) throw new AppError("Account does not exist. Please signup first.", 404);

  if (!user.isResetPasswordOTPVerified) throw new AppError("Invalid reset password request. Kindly verify the reset password OTP first.")
  
  user.password = userData.password;

  user.isResetPasswordOTPVerified = false;

  await user.save();
}

export const editUser = async (userData) => {
  const user = await User.findByIdAndUpdate(
    userData.userId, 
    userData, 
    {new: true, runValidators: true}
  )
  .select("-password -OTP -lastResetPasswordOTPSentAt")

  if (!user) throw new AppError("Account not found", 404);

  return user;
};

const generateOTPUpdateUserAndSendEmail = async (user, isSimpleOTP) => {
  const COOLDOWN_MS = 60 * 1000;
  const now = Date.now();
  let code = null;

  if (isSimpleOTP) {
    if (user?.lastOTPSentAt && (now - user?.lastOTPSentAt.getTime()) < COOLDOWN_MS ) {
      const secondsLeft = Math.ceil((COOLDOWN_MS - (now - user.lastOTPSentAt.getTime())) / 1000);
      throw new AppError(`Please wait for ${secondsLeft} second(s) before making a new request`, 429);
    }
  } else {
    if (user?.lastResetPasswordOTPSentAt && (now - user?.lastResetPasswordOTPSentAt.getTime()) < COOLDOWN_MS ) {
      const secondsLeft = Math.ceil((COOLDOWN_MS - (now - user.lastResetPasswordOTPSentAt.getTime())) / 1000);
      throw new AppError(`Please wait for ${secondsLeft} second(s) before making a new request`, 429);
    }
  }

  code = generateOTP();

  const OTP = {
    code: code,
    expiryTime: new Date(Date.now() + OTP_EXPIRY_MIN * 60 * 1000)
  };

  user.OTP = OTP;

  try {
    await sendEmail(user.email, 'Email Verification', `Please verify your email\nYour OTP is: ${code}`);
  } catch (error) {
    throw new AppError("Something went wrong. Please try again later.", 500);
  }

  if (isSimpleOTP) {
    user.lastOTPSentAt = new Date();
  } else {
    user.lastResetPasswordOTPSentAt = new Date();
  }

  await user.save();
}