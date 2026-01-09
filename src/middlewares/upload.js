import multer from 'multer';

// Use memory storage to store files in buffer (for Vercel Blob upload)
const storage = multer.memoryStorage();

// Configure multer with file size limits and file type validation
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

export default upload;
