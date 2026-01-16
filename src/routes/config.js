import express from 'express';
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

// Public route (mobile app - no auth)
ConfigRouter.get('/popup/public', getPublicPopupConfig);

// Protected routes (admin only)
ConfigRouter.get('/popup', authMiddleware, authorizeRoles('admin'), getPopupConfig);
ConfigRouter.put('/popup', authMiddleware, authorizeRoles('admin'), updatePopupImage);
ConfigRouter.put('/popup/toggle', authMiddleware, authorizeRoles('admin'), togglePopupStatus);
ConfigRouter.delete('/popup', authMiddleware, authorizeRoles('admin'), deletePopupImage);

export default ConfigRouter;
