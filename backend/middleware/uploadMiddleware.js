const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Where uploaded files actually live on disk
const uploadDir = path.join(__dirname, '..', 'uploads', 'products');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Unique name so two "cocktail.png" uploads never collide
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, uniqueName);
    }
});

const allowedTypes = /^image\/(png|jpe?g|webp|gif)$/;

const fileFilter = (req, file, cb) => {
    if (allowedTypes.test(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PNG, JPG, WEBP, or GIF images are allowed'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB per image
});

// Deletes a previously-uploaded image from disk. Safe to call with '' or a
// path that no longer exists — failures here are logged, never thrown.
const deleteImageFile = (imagePath) => {
    if (!imagePath) return;
    const fullPath = path.join(__dirname, '..', imagePath);
    fs.unlink(fullPath, (err) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Failed to delete image file:', err.message);
        }
    });
};

module.exports = { upload, deleteImageFile };