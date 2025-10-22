// middlewares/uploadMiddleware.js
const multer = require("multer");
const path = require("path");
const fs = require('fs');
// Define storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, "../ManualDocumentPreparation");

        // ✅ Check if folder exists, if not create it
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true }); // recursive ensures nested dirs also created
            console.log("📂 Created folder:", uploadPath);
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

// Export upload instance
const upload = multer({ storage });

module.exports = upload;
