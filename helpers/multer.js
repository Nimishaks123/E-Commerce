const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
    if (!allowedExtensions.test(file.originalname)) {
        return cb(new Error('Invalid file type. Only .jpg, .jpeg, .png, and .gif are allowed.'));
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize:  5 * 1024 * 1024  } // 5MB file size limit
}).array('images', 5); // Adjust the limit as needed

module.exports = upload;
