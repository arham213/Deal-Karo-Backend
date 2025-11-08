import { AppError } from "../utils/AppError.js";

export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            throw new AppError("Forbidden: You don't have permission to access this resource.", 403);
        }
        next();
    }
}