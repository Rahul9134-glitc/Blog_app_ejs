// config/multerConfig.js

import multer from 'multer';
import path from 'path';

// ************************************************
// * ⚙️ STORAGE CONFIGURATION
// ************************************************
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // हम दोनों तरह की इमेज एक ही फोल्डर में स्टोर कर रहे हैं
        cb(null, "public/uploads/");
    },

    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        // फ़ाइल नाम: fieldname-timestamp.ext
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});


// ************************************************
// * 🛡️ FILE FILTER (दोनों के लिए समान)
// ************************************************
const imageFileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    // Note: error message should be passed to the next middleware/error handler
    cb(new Error("File upload only supports images (jpeg, jpg, png, gif)")); 
};


// ************************************************
// * 1. POST IMAGE UPLOADER
// ************************************************
const uploadPostImage = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
    fileFilter: imageFileFilter
}).single('coverImage');


// ************************************************
// * 2. PROFILE IMAGE UPLOADER (NEW)
// ************************************************
const uploadProfileImage = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 2 }, // 2MB limit (प्रोफ़ाइल के लिए कम साइज़)
    fileFilter: imageFileFilter
}).single('profileImage');


export { uploadPostImage, uploadProfileImage };