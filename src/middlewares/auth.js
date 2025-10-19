import { verifyToken } from "../utils/jwt.js";
import { failureResponse } from "../utils/response.js";

export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return failureResponse(res, "Authorization header missing or malformed", 401);
        }

        const token = authHeader.split(' ')[1];

        const decoded = verifyToken(token);

        req.user = decoded;

        next();
    } catch (error) {
        next(error);
    }
}