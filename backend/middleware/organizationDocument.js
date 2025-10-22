const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

const uploadsDir = "organizationDocumentModule/";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueSuffix);
    },
});



const organizationDocumentMulter = multer({
    storage,
    // limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB file limit
        fieldSize: 10 * 1024 * 1024, // Increase form field size limit
    },
});

module.exports = organizationDocumentMulter;
