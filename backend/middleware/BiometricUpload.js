const multer = require("multer");

const destination = (req, file, cb) => {
  cb(null, "./uploads/biometric");
};

const filename = (req, file, cb) => {
  cb(null, Date.now() + "-" + file.originalname);
};

const storage = multer.diskStorage({
  destination,
  filename,
});

// Accept ANY fields like files[0][], files[1][]
const biometricUpload = multer({ storage }).any();

module.exports = biometricUpload;
