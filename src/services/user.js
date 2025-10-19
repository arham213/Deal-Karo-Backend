import bcrypt from "bcrypt";
import { User } from "../models/index.js";
import { generateToken } from "../utils/jwt.js";
import { generateOTP, verifyOTP } from "../utils/OTP.js";
import { sendEmail } from "../utils/emailServer.js";
import { AppError } from "../utils/AppError.js";

const OTP_EXPIRY_MIN = 1;

export const getAllDealers = async () => {
  const users = await User.find({ role: 'dealer' });

  if (!users) throw new AppError("Error fetching dealers")
}

export const getUserById = async (userId) => {
  const user = await User.findById(userId)
  .select("-password -OTP -resetPasswordOTP -lastOTPSentAt -lastResetPasswordOTPSentAt")

  if (!user) throw new AppError("User not found", 404);

  return user;
}

export const createUser = async (userData) => {
  const user = await User.findOne({ contactNo: userData.contactNo }) 

  if (user) {
    if (user.isContactNoVerified) throw new AppError("Account with this number already exists. Please Login.", 409);

    await generateOTPUpdateUserAndSendEmail(user, true);

    return [ user._id, 'Account exists but number not verified. OTP resent.' ];
  }

  const code = generateOTP();

  const OTP = {
    code: code,
    expiryTime: new Date(Date.now() + OTP_EXPIRY_MIN * 60 * 1000)
  };

  const lastOTPSentAt = new Date();

  const newUser = await User.create({...userData, OTP, lastOTPSentAt});

  try {
    await sendEmail(userData.email, 'Email Verification', `Please verify your email\nYour OTP is: ${code}`);
  } catch (error) {
    throw new AppError("Something went wrong. Please try again later.", 500);
  }

  return [newUser._id, null];
};

export const verifyNumber = async (userData) => {
    const user = await User.findOne({_id: userData.userId});

    if (!user) throw new AppError("User not found. Please signup first.", 404);

    if (user.isContactNoVerified) throw new AppError("Number already verified. Please login.", 400);

    await verifyOTP(userData.OTP, user.OTP);

    user.isContactNoVerified = true;

    await user.save();
}

export const resendOTP = async (userId) => {
  const user = await User.findById(userId);

  if (!user) throw new AppError("User not found. Please signup first.", 404);

  if (user.isContactNoVerified) throw new AppError("Number already verified. Please login.", 400);

  await generateOTPUpdateUserAndSendEmail(user, true);
}

export const loginUser = async (userData) => {
    const user = await User.findOne({ contactNo: userData.contactNo });

    if (!user) throw new AppError("Invalid number or password.", 401);

    if (!user.isContactNoVerified) {
        await generateOTPUpdateUserAndSendEmail(user, true);

        return { success: false, error: "Number not verified. OTP sent.", userId: user._id, statusCode: 403 };
    }

    const isPasswordCorrect = await bcrypt.compare(userData.password, user.password);

    if (!isPasswordCorrect) throw new AppError("Invalid number or password.", 401);

    const token = generateToken(user);

    const { password, ...userWithoutPasssword } = user.toObject();

    return { success: true, user: userWithoutPasssword, token: token };
}

export const sendResetPasswordOTP = async (userId) => {
  const user = await User.findById(userId);

  if (!user) throw new AppError("Account does not exists. Please signup first.", 404);

  await generateOTPUpdateUserAndSendEmail(user, false);
}

export const resetPassword = async (userData, userId) => {
  const user = await User.findById(userId);

  if (!user) throw new AppError("Account does not exist. Please signup first.", 404);

  if (!user.resetPasswordOTP) throw new AppError("Invalid or expired reset password request.", 400);

  await verifyOTP(userData.OTP, user.resetPasswordOTP);
  
  user.password = userData.newPassword;

  await user.save();
}

export const editUser = async (userId, userData) => {
  const user = await User.findByIdAndUpdate(
    userId, 
    userData, 
    {new: true, runValidators: true}
  )
  .select("-password -OTP -resetPasswordOTP -lastOTPSentAt -lastResetPasswordOTPSentAt")
  .populate("addresses")
  .populate("wishlistItems");

  if (!user) throw new AppError("Account not found", 404);

  return user;
};

const generateOTPUpdateUserAndSendEmail = async (user, isSimpleOTP) => {
  const COOLDOWN_MS = 60 * 1000;
  const now = Date.now();
  let code = null;

  if (isSimpleOTP) {
    // generate simple OTP
    if (user.lastOTPSentAt && (now - user.lastOTPSentAt.getTime()) < COOLDOWN_MS ) {
      const secondsLeft = Math.ceil((COOLDOWN_MS - (now - user.lastOTPSentAt.getTime())) / 1000);
      throw new AppError(`Please wait for ${secondsLeft} second(s) before making a new request`, 429);
    }

    code = generateOTP();

    const OTP = {
      code: code,
      expiryTime: new Date(Date.now() + OTP_EXPIRY_MIN * 60 * 1000)
    };

    user.OTP = OTP;
    user.lastOTPSentAt = new Date();
  } else {
    // generate password reset OTP
    if (user.lastResetPasswordOTPSentAt && (now - user.lastResetPasswordOTPSentAt.getTime()) < COOLDOWN_MS ) {
      const secondsLeft = Math.ceil((COOLDOWN_MS - (now - user.lastResetPasswordOTPSentAt.getTime())) / 1000);
      throw new AppError(`Please wait for ${secondsLeft} second(s) before making a new request`, 429);
    }

    code = generateOTP();

    const resetPasswordOTP = {
      code: code,
      expiryTime: new Date(Date.now() + OTP_EXPIRY_MIN * 60 * 1000)
    };

    user.resetPasswordOTP = resetPasswordOTP;
    user.lastResetPasswordOTPSentAt = new Date();
  }

  await user.save();

  try {
    await sendEmail(user.email, 'Email Verification', `Please verify your email\nYour OTP is: ${code}`);
  } catch (error) {
    throw new AppError("Something went wrong. Please try again later.", 500);
  }
}