import { getAllChats, createOrGetChat, getChatMessages, uploadChatImage, uploadChatVoice } from "../services/chat.js";
import { successResponse } from "../utils/response.js";

export const GetAllChats = async (req, res, next) => {
    try {
        const chats = await getAllChats(req.user.id);

        return successResponse(res, "Chats fetched successfully", { chats }, 200);
    } catch (error) {
        next(error);
    }
};

export const CreateOrGetChat = async (req, res, next) => {
    try {
        console.log('🟡 [CHAT] CreateOrGetChat controller reached');
        const { participantId } = req.body;
        const result = await createOrGetChat(req.user.id, participantId);

        const statusCode = result.isNew ? 201 : 200;
        return successResponse(res, result.message, { chat: result.chat }, statusCode);
    } catch (error) {
        next(error);
    }
};

export const GetChatMessages = async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const { limit, skip } = req.query;

        const messages = await getChatMessages(chatId, req.user.id, limit, skip);

        return successResponse(res, "Messages fetched successfully", { messages }, 200);
    } catch (error) {
        next(error);
    }
};

export const UploadChatImage = async (req, res, next) => {
    try {
        console.log('🟡 [CHAT] UploadChatImage controller reached');
        const imageUrl = await uploadChatImage(req.file);

        return successResponse(res, "Image uploaded successfully", { imageUrl }, 200);
    } catch (error) {
        next(error);
    }
};

export const UploadChatVoice = async (req, res, next) => {
    try {
        console.log('🟡 [CHAT] UploadChatVoice controller reached', req.file);
        const audioUrl = await uploadChatVoice(req.file);

        return successResponse(res, "Voice uploaded successfully", { audioUrl }, 200);
    } catch (error) {
        next(error);
    }
};
