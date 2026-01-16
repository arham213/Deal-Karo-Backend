import AppConfig from '../models/appConfig.js';
import { put, del } from '@vercel/blob';

const POPUP_CONFIG_KEY = 'launch_popup';

/**
 * Get popup configuration
 */
export const getPopupConfig = async () => {
    let config = await AppConfig.findOne({ key: POPUP_CONFIG_KEY });

    if (!config) {
        return {
            key: POPUP_CONFIG_KEY,
            imageUrl: '',
            isActive: false,
            updatedAt: new Date()
        };
    }

    return config;
};

/**
 * Get public popup config for mobile app
 */
export const getPublicPopupConfig = async () => {
    const config = await AppConfig.findOne({ key: POPUP_CONFIG_KEY });

    if (!config || !config.isActive || !config.imageUrl) {
        return { showPopup: false };
    }

    return {
        showPopup: true,
        imageUrl: config.imageUrl
    };
};

/**
 * Upload new popup image
 * @param {Object} imageFile - The uploaded file object
 * @param {String} userId - Admin user ID
 */
export const uploadPopupImage = async (imageFile, userId) => {
    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(imageFile.mimetype)) {
        throw new Error('Invalid file type. Allowed: PNG, JPG, WEBP');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (imageFile.size > maxSize) {
        throw new Error('File size exceeds 5MB limit');
    }

    // Delete old image if exists
    const existingConfig = await AppConfig.findOne({ key: POPUP_CONFIG_KEY });
    if (existingConfig?.imageUrl) {
        await deleteImageFromBlob(existingConfig.imageUrl);
    }

    // Upload to Vercel Blob
    const filename = `popup-images/${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`;
    const blob = await put(filename, imageFile.data, {
        access: 'public',
        contentType: imageFile.mimetype
    });

    // Update database
    const config = await AppConfig.findOneAndUpdate(
        { key: POPUP_CONFIG_KEY },
        {
            imageUrl: blob.url,
            isActive: true,
            updatedAt: new Date(),
            updatedBy: userId
        },
        { upsert: true, new: true }
    );

    return config;
};

/**
 * Toggle popup active status
 * @param {Boolean} isActive - New status
 * @param {String} userId - Admin user ID
 */
export const togglePopupStatus = async (isActive, userId) => {
    const existingConfig = await AppConfig.findOne({ key: POPUP_CONFIG_KEY });

    if (!existingConfig || !existingConfig.imageUrl) {
        throw new Error('Cannot toggle status - no popup image configured');
    }

    const config = await AppConfig.findOneAndUpdate(
        { key: POPUP_CONFIG_KEY },
        {
            isActive,
            updatedAt: new Date(),
            updatedBy: userId
        },
        { new: true }
    );

    return config;
};

/**
 * Delete popup image
 * @param {String} userId - Admin user ID
 */
export const deletePopupImage = async (userId) => {
    const existingConfig = await AppConfig.findOne({ key: POPUP_CONFIG_KEY });

    if (!existingConfig || !existingConfig.imageUrl) {
        throw new Error('No popup image to delete');
    }

    // Delete from Vercel Blob
    await deleteImageFromBlob(existingConfig.imageUrl);

    // Update database
    const config = await AppConfig.findOneAndUpdate(
        { key: POPUP_CONFIG_KEY },
        {
            imageUrl: '',
            isActive: false,
            updatedAt: new Date(),
            updatedBy: userId
        },
        { new: true }
    );

    return config;
};

/**
 * Helper: Delete image from Vercel Blob
 * @param {String} imageUrl - Blob URL to delete
 */
export const deleteImageFromBlob = async (imageUrl) => {
    try {
        if (imageUrl) {
            await del(imageUrl);
        }
    } catch (error) {
        console.log('Could not delete blob image:', error.message);
        // Non-critical, continue execution
    }
};
