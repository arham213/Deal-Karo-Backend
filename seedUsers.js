// scripts/seedUsers.js
import mongoose from "mongoose";
import { faker } from '@faker-js/faker';
import UserModel from "./src/models/user.js"; // adjust path

const MONGO_URI = "mongodb://localhost:27017/deal-karo";

// ---------- Generate Random User ----------
const generateUser = () => {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    contactNo: faker.phone.number("03#########"), // Pakistan-style
    estateName: faker.company.name(),
    password: "password123", // will be hashed automatically
    verificationStatus: faker.helpers.arrayElement(["verified", "pending", "rejected"]),
    OTP: {
      code: "",               // leave empty so hook will null it
      expiryTime: null
    },
    lastOTPSentAt: null,
    lastResetPasswordOTPSentAt: null,
    isEmailVerified: faker.datatype.boolean(),
    isResetPasswordOTPVerified: faker.datatype.boolean(),
    onBoardingCompleted: faker.datatype.boolean(),
    role: faker.helpers.arrayElement(["dealer"]),
  };
};

// ---------- Main Seeder Function ----------
const seedUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected!");

    // ------------ OPTIONAL: Clear old users ------------
    // await UserModel.deleteMany({});
    // console.log("Old users removed.");

    // Generate 100 random users
    const users = Array.from({ length: 100 }).map(() => generateUser());

    await UserModel.insertMany(users);
    console.log("100 Random Users Inserted Successfully!");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

seedUsers();