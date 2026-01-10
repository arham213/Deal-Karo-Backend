import { AppError } from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
  console.log('🔐 [AUTH] Auth middleware called for:', req.method, req.path);

  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Check if header exists and is in correct format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log('❌ [AUTH] Authorization header missing or malformed');
      throw new AppError("Authorization header missing or malformed", 401);
    }

    // 2️⃣ Extract token
    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log('❌ [AUTH] Token missing from header');
      throw new AppError("Token missing from header", 401);
    }

    // 3️⃣ Verify token (handle thrown error cleanly)
    let decoded;
    try {
      decoded = verifyToken(token);
      console.log('✅ [AUTH] Token verified for user:', decoded.id);
    } catch (err) {
      console.error('❌ [AUTH] Token verification failed:', err.message);
      return next(err); // RETURN here to stop execution
    }

    // 4️⃣ Attach user info to request for downstream access
    req.user = decoded;

    // 5️⃣ Continue to the next middleware
    next();
  } catch (error) {
    console.error('❌ [AUTH] Auth middleware error:', error.message);
    next(error);
  }
};