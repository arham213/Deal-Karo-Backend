import bcrypt from "bcrypt";
import { Property, User } from "../models/index.js";
import { generateToken } from "../utils/jwt.js";
import { generateOTP, verifyOTP } from "../utils/OTP.js";
import { sendEmail } from "../utils/emailServer.js";
import { AppError } from "../utils/AppError.js";
import { put, del } from "@vercel/blob";

const OTP_EXPIRY_MIN = 10;

export const getAllDealers = async (page = 1, limit = 10) => {
  // Ensure page and limit are integers
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;

  // Calculate pagination
  const skip = (pageNum - 1) * limitNum;

  const dealers = await User.find({ role: 'dealer' })
    .select("-passowrd -OTP -lastResetPasswordOTPSentAt -isResetPasswordOTPVerified -isEmailVerified")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  // Get total count for pagination
  const total = await User.countDocuments({ role: "dealer" });

  return {
    dealers,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  };
}

export const getUserById = async (userId) => {
  const user = await User.findById(userId)
    .select("-password -OTP -lastResetPasswordOTPSentAt -isResetPasswordOTPVerified -isEmailVerified")
    .lean()

  if (!user) throw new AppError("User not found", 404);

  return user;
}

export const getAllUsers = async (currentUserId) => {
  const users = await User.find({
    _id: { $ne: currentUserId } // Exclude current user
  }).select('name email online lastSeen profileImage');

  return users;
}

export const getStats = async () => {
  const allUsers = await User.find({ role: "dealer" });

  // const verifiedUsers = await User.find({ role: "dealer", isAccountVerified: true });
  const verifiedUsers = await User.find({ role: "dealer", verificationStatus: "verified" });

  const stats = {
    totalUsers: allUsers?.length || 0,
    verifiedUsers: verifiedUsers?.length || 0,
    unverifiedUsers: (allUsers?.length - verifiedUsers?.length) || 0
  }

  return stats;
}

export const createUser = async (userData) => {
  const oldUser = await User.findOne({ email: userData.email, role: "dealer" })

  if (oldUser) throw new AppError("User with this email already exists. Please Login.", 409);

  // await User.create(userData);
  const code = generateOTP();
  const OTP = {
    code: code,
    expiryTime: new Date(Date.now() + OTP_EXPIRY_MIN * 60 * 1000)
  };

  const user = await User.create({ ...userData, OTP });

  await sendEmail(userData.email, 'Email Verification', `Please verify your email\nYour OTP is: ${code}`);

  const lastOTPSentAt = new Date();
  user.lastOTPSentAt = lastOTPSentAt;
  await user.save();

  return user._id;
};

// export const createUser = async (userData) => {
//   const userExists = await User.findOne({ email: userData.email })

//   if (userExists) {
//     throw new Error("User with this email already exists");
//   }

//   const code = OTPGenerator();
//   const OTP = {
//     code: code,
//   };

//   const user = await User.create({...userData, OTP});

//   await sendEmail(userData.email, 'Email Verification', `Please verify your email\nYour OTP is: ${code}`);

//   return user._id;
// };

export const createAdmin = async (userData) => {
  const user = await User.findOne({ email: userData.email, role: "admin" })

  if (user) throw new AppError("Admin with this email already exists. Please Login.", 409);

  const { adminSecret, name, email, contactNo, estateName, password, verificationStatus } = userData;

  if (adminSecret !== process.env.ADMIN_SECRET) {
    throw new AppError("Unauthorized", 403);
  }

  await User.create({
    name,
    email,
    contactNo,
    estateName,
    password,
    role: "admin",
    verificationStatus
  });
};

export const verifyAccount = async (userId) => {
  const user = await User.findById(userId);

  if (!user) throw new AppError('User not fouund.', 404);

  user.verificationStatus = "verified";

  await user.save();
}

export const verifyAllAccounts = async () => {
  await User.updateMany(
    {
      verificationStatus: { $in: ["pending", "rejected"] },
      role: "dealer",
    },
    { $set: { verificationStatus: "verified" } }
  );

  return { success: true, message: "All dealer accounts verified." };
};


export const rejectAccount = async (userId) => {
  const user = await User.findById(userId);

  if (!user) throw new AppError('User not fouund.', 404);

  user.verificationStatus = "rejected";

  await user.save();
}

export const revokeAccount = async (userId) => {
  const user = await User.findById(userId);

  if (!user) throw new AppError('User not fouund.', 404);

  user.verificationStatus = "revoked";

  await user.save();
}

export const verifyEmail = async (userData) => {
  console.log('userData in service:', userData);
  const user = await User.findById(userData.userId);
  console.log('user from DB:', user);

  if (!user) throw new AppError("User not found. Please signup first.", 404);

  if (user.isEmailVerified) throw new AppError("Email already verified. Please login.", 400);

  await verifyOTP(userData.OTP, user.OTP);

  user.isEmailVerified = true;
  user.OTP.code = null;
  user.OTP.expiryTime = null;
  // user.OTP = null;
  console.log('user before save:', user);

  await user.save();

  console.log('user after save:', user);

  const token = generateToken(user);

  console.log('generated token:', token);

  const { password, OTP, lastResetPasswordOTPSentAt, isResetPasswordOTPVerified, isEmailVerified, ...userWithoutPasssword } = user.toObject();

  console.log('user:', user);
  console.log('token:', token);

  return { user: userWithoutPasssword, token };
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

  const { password, OTP, lastResetPasswordOTPSentAt, isResetPasswordOTPVerified, isEmailVerified, ...userWithoutPasssword } = user.toObject();

  return { success: true, user: userWithoutPasssword, token: token };
}

export const sendResetPasswordOTP = async (email) => {
  const user = await User.findOne({ email: email });

  if (!user) throw new AppError("Account does not exists. Please signup first.", 404);

  console.log('user:', user);

  await generateOTPUpdateUserAndSendEmail(user, false);

  console.log('Forgot password OTP sent');

  return user._id;
}

export const verifyResetPasswordOTP = async (userData) => {
  const user = await User.findById(userData.userId);

  if (!user) throw new AppError("Account does not exist. Please signup first.", 404);

  if (!user.OTP) throw new AppError("Invalid or expired reset password request.", 400);

  await verifyOTP(userData.OTP, user.OTP);

  user.isResetPasswordOTPVerified = true;
  user.OTP.code = null;
  user.OTP.expiryTime = null;

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
  const user = await User.findOne({ email: userData.email });

  if (user) throw new AppError("User with this email already exists", 404);

  console.log('userData in service:', userData);

  const updatedUser = await User.findByIdAndUpdate(
    userData._id,
    userData,
    { new: true, runValidators: true }
  )
    .select("-password -OTP -lastResetPasswordOTPSentAt -isResetPasswordOTPVerified -isEmailVerified")
    .lean()

  if (!updatedUser) throw new AppError("Account not found", 404);

  return updatedUser;
};

export const deleteUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404)
  }

  const userProperties = await Property.find({ userId });

  userProperties?.forEach(async (userProperty) => {
    await userProperty.deleteOne();
  })

  await user.deleteOne();
}

const generateOTPUpdateUserAndSendEmail = async (user, isSimpleOTP) => {
  const COOLDOWN_MS = 60 * 1000;
  const now = Date.now();
  let code = null;

  if (isSimpleOTP) {
    if (user?.lastOTPSentAt && (now - user?.lastOTPSentAt.getTime()) < COOLDOWN_MS) {
      const secondsLeft = Math.ceil((COOLDOWN_MS - (now - user.lastOTPSentAt.getTime())) / 1000);
      throw new AppError(`Please wait for ${secondsLeft} second(s) before making a new request`, 429);
    }
  } else {
    if (user?.lastResetPasswordOTPSentAt && (now - user?.lastResetPasswordOTPSentAt.getTime()) < COOLDOWN_MS) {
      const secondsLeft = Math.ceil((COOLDOWN_MS - (now - user.lastResetPasswordOTPSentAt.getTime())) / 1000);
      throw new AppError(`Please wait for ${secondsLeft} second(s) before making a new request`, 429);
    }
  }

  console.log('generating code');

  code = generateOTP();

  const OTP = {
    code: code,
    expiryTime: new Date(Date.now() + OTP_EXPIRY_MIN * 60 * 1000)
  };

  user.OTP = OTP;

  console.log('OTP is:', OTP);

  try {
    console.log('sending email');
    await sendEmail(user.email, 'Email Verification', `Please verify your email\nYour OTP is: ${code}`);
    console.log('email sent');
  } catch (error) {
    // throw new AppError("Something went wrong. Please try again later.", 500);
    console.error("EMAIL ERROR:", error);
    throw error;
  }

  if (isSimpleOTP) {
    user.lastOTPSentAt = new Date();
  } else {
    user.lastResetPasswordOTPSentAt = new Date();
  }

  console.log('saving user');
  await user.save();
  console.log('saved user');
}

/**
 * Upload user profile image to Vercel Blob
 * @param {String} userId - The user's ID
 * @param {Object} file - The uploaded file object from multer
 * @returns {String} - The URL of the uploaded image
 */
export const uploadProfileImage = async (userId, file) => {
  if (!file) {
    throw new AppError('No image file provided', 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Delete old profile image if exists
  if (user.profileImage) {
    try {
      await del(user.profileImage);
      console.log('Old profile image deleted:', user.profileImage);
    } catch (error) {
      console.error('Failed to delete old profile image:', error.message);
      // Continue with upload even if deletion fails
    }
  }

  // Upload new image to Vercel Blob
  const blob = await put(`profile-images/${userId}-${Date.now()}-${file.originalname}`, file.buffer, {
    access: 'public',
    contentType: file.mimetype
  });

  // Update user with new profile image URL
  user.profileImage = blob.url;
  await user.save();

  console.log('Profile image uploaded:', blob.url);

  return blob.url;
};

/**
 * Delete user profile image from Vercel Blob
 * @param {String} userId - The user's ID
 */
export const deleteProfileImage = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.profileImage) {
    throw new AppError('No profile image to delete', 400);
  }

  // Delete image from Vercel Blob
  try {
    await del(user.profileImage);
    console.log('Profile image deleted:', user.profileImage);
  } catch (error) {
    console.error('Failed to delete profile image from blob:', error.message);
    // Continue with clearing the field even if blob deletion fails
  }

  // Clear profile image field
  user.profileImage = null;
  await user.save();
};