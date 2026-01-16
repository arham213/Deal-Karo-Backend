import {
    getPopupConfig as getPopupConfigService,
    getPublicPopupConfig as getPublicPopupConfigService,
    uploadPopupImage,
    togglePopupStatus as togglePopupStatusService,
    deletePopupImage as deletePopupImageService
} from '../services/config.js';

/**
 * GET /api/config/popup
 */
export const getPopupConfig = async (req, res) => {
    try {
        const config = await getPopupConfigService();
        return res.status(200).json({ success: true, data: config });
    } catch (error) {
        console.error('Error fetching popup config:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch popup configuration' });
    }
};

/**
 * GET /api/config/popup/public
 */
export const getPublicPopupConfig = async (req, res) => {
    try {
        const config = await getPublicPopupConfigService();
        return res.status(200).json({ success: true, data: config });
    } catch (error) {
        return res.status(200).json({ success: true, data: { showPopup: false } });
    }
};

/**
 * PUT /api/config/popup
 */
export const updatePopupImage = async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }

        const config = await uploadPopupImage(req.files.image, req.user._id);
        return res.status(200).json({ success: true, message: 'Popup image uploaded successfully', data: config });
    } catch (error) {
        console.error('Error uploading popup image:', error);
        return res.status(400).json({ success: false, message: error.message || 'Failed to upload popup image' });
    }
};

/**
 * PUT /api/config/popup/toggle
 */
export const togglePopupStatus = async (req, res) => {
    try {
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ success: false, message: 'isActive must be a boolean value' });
        }

        const config = await togglePopupStatusService(isActive, req.user._id);
        return res.status(200).json({ success: true, message: `Popup ${isActive ? 'enabled' : 'disabled'} successfully`, data: config });
    } catch (error) {
        console.error('Error toggling popup status:', error);
        return res.status(400).json({ success: false, message: error.message || 'Failed to update popup status' });
    }
};

/**
 * DELETE /api/config/popup
 */
export const deletePopupImage = async (req, res) => {
    try {
        const config = await deletePopupImageService(req.user._id);
        return res.status(200).json({ success: true, message: 'Popup image deleted successfully', data: config });
    } catch (error) {
        console.error('Error deleting popup image:', error);
        return res.status(400).json({ success: false, message: error.message || 'Failed to delete popup image' });
    }
};
