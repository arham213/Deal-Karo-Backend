import express from 'express';
import fileUpload from 'express-fileupload';
import {
    getPopupConfig,
    getPublicPopupConfig,
    updatePopupImage,
    togglePopupStatus,
    deletePopupImage
} from '../controllers/config.js';
import { authMiddleware } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const ConfigRouter = express.Router();

// File upload middleware for popup image routes
const fileUploadMiddleware = fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 },
    abortOnLimit: true
});

// Public route (mobile app - no auth)
ConfigRouter.get('/popup/public', getPublicPopupConfig);

// Protected routes (admin only)
ConfigRouter.get('/popup', authMiddleware, authorizeRoles('admin'), getPopupConfig);
ConfigRouter.put('/popup', authMiddleware, authorizeRoles('admin'), fileUploadMiddleware, updatePopupImage);
ConfigRouter.put('/popup/toggle', authMiddleware, authorizeRoles('admin'), togglePopupStatus);
ConfigRouter.delete('/popup', authMiddleware, authorizeRoles('admin'), deletePopupImage);

export default ConfigRouter;
