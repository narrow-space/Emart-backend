const multer = require("multer");

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        // Ensure that the destination directory exists
        callback(null, "./productimages");
    },
    filename: (req, file, callback) => {
        const filename = `image-${Date.now()}.${file.originalname}`;
        callback(null, filename);
    }
});

// File filter function
const fileFilter = (req, file, callback) => {
    // Check if the file type is allowed
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg" || file.mimetype === "image/webp" || file.mimetype === "image/avif") {
        // Accept the file
        callback(null, true);
    } else {
        // Reject the file
        callback(new Error("Only PNG, JPG, JPEG, WEBP, and AVIF formatted files are allowed"));
    }
};

// Multer instance
const productsUpload = multer({
    storage: storage,
    fileFilter: fileFilter
});

module.exports = productsUpload;
