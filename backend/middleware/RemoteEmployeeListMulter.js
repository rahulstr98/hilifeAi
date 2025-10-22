const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create directory if it doesn't exist
const uploadDir = path.join(__dirname, '../RemoteEmployeeLists');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  }
});

const upload = multer({ storage });
module.exports.uploadRemoteWorkModeFiles = upload.fields([
  { name: 'wfhsetupphoto', maxCount: 5 },
  { name: 'internetssidphoto', maxCount: 5 }
]);
