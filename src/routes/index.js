import express from "express";
import UserRouter from "./user.js";
import PropertyRouter from "./property.js";
import NoteRouter from "./note.js";
import { authMiddleware } from "../middlewares/auth.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

router.use('/users', UserRouter);
router.use('/properties', authMiddleware, authorizeRoles("dealer"), PropertyRouter);
router.use('/notes', authMiddleware, authorizeRoles("dealer"), NoteRouter);

export default router;
