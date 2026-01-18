import { Chat, Message, User } from "../models/index.js";
import { AppError } from "../utils/AppError.js";
import { put } from '@vercel/blob';

export const getAllChats = async (userId) => {
    const chats = await Chat.find({
        participants: userId
    })
        .populate('participants', 'name email online lastSeen')
        .populate('lastMessage')
        .sort({ updatedAt: -1 });

    return chats;
};

export const createOrGetChat = async (userId, participantId) => {
    if (!participantId) {
        throw new AppError('Participant ID is required', 400);
    }

    if (participantId === userId.toString()) {
        throw new AppError('Cannot create chat with yourself', 400);
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({
        participants: { $all: [userId, participantId] }
    })
        .populate('participants', 'name email online lastSeen')
        .populate('lastMessage');

    if (existingChat) {
        return {
            message: 'Chat already exists',
            chat: existingChat,
            isNew: false
        };
    }

    console.log('🟡 [CHAT] Chat does not exist, creating new chat');

    // Create new chat
    const chat = new Chat({
        participants: [userId, participantId]
    });

    await chat.save();
    await chat.populate('participants', 'name email online lastSeen');

    return {
        message: 'Chat created successfully',
        chat,
        isNew: true
    };
};

export const getChatMessages = async (chatId, userId, limit = 50, skip = 0) => {
    // Verify user is participant in this chat
    const chat = await Chat.findOne({
        _id: chatId,
        participants: userId
    });

    if (!chat) {
        throw new AppError('Chat not found', 404);
    }

    const messages = await Message.find({ chat: chatId })
        .populate('sender', 'name')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

    return messages.reverse();
};

export const uploadChatImage = async (file) => {
    if (!file) {
        throw new AppError('No file uploaded', 400);
    }

    const blob = await put(`chat-images/${Date.now()}-${file.originalname}`, file.buffer, {
        access: 'public',
        contentType: file.mimetype
    });

    return blob.url;
};

export const uploadChatVoice = async (file) => {
    if (!file) {
        throw new AppError('No audio file provided', 400);
    }

    const blob = await put(`voice-messages/${Date.now()}.m4a`, file.buffer, {
        access: 'public',
        contentType: 'audio/m4a'
    });

    console.log('🟢 [CHAT] Voice message uploaded successfully', blob.url);

    return blob.url;
};
