import express from "express";
import UserRouter from "./user.js";
import PropertyRouter from "./property.js";
import NoteRouter from "./note.js";
import { authMiddleware } from "../middlewares/auth.js";
import ChatRouter from "./chat.js";
import ConfigRouter from "./config.js";

const router = express.Router();

router.use('/users', UserRouter);
router.use('/properties', authMiddleware, PropertyRouter);
router.use('/notes', authMiddleware, NoteRouter);
router.use('/chats', authMiddleware, ChatRouter);
router.use('/config', ConfigRouter);

export default router;
