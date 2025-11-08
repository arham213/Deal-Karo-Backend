import { AppError } from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Check if header exists and is in correct format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authorization header missing or malformed", 401);
    }

    // 2️⃣ Extract token
    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new AppError("Token missing from header", 401);
    }

    // 3️⃣ Verify token (handle thrown error cleanly)
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      next(err);
    }

    // 4️⃣ Attach user info to request for downstream access
    req.user = decoded;

    // 5️⃣ Continue to the next middleware
    next();
  } catch (error) {
    next(error);
  }
};