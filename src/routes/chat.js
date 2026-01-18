import express from 'express';
import { GetAllChats, CreateOrGetChat, GetChatMessages, UploadChatImage, UploadChatVoice } from '../controllers/chat.js';
import { authMiddleware } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const ChatRouter = express.Router();

// Get all chats for logged-in user
ChatRouter.get('/', authMiddleware, GetAllChats);

// Create or get existing chat with another user
ChatRouter.post('/create', authMiddleware, CreateOrGetChat);

// Get messages for a specific chat
ChatRouter.get('/:chatId/messages', authMiddleware, GetChatMessages);

// Upload chat image
ChatRouter.post('/uploadImage', authMiddleware, upload.single('image'), UploadChatImage);

// Upload voice message
ChatRouter.post('/upload-voice', authMiddleware, upload.single('audio'), UploadChatVoice);

export default ChatRouter;


