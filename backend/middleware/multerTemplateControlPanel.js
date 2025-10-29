const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 🗂️ Define upload path
const uploadPath = path.join(__dirname, "../templatecontrolpanel");

// Ensure folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log("📂 Created upload folder:", uploadPath);
}

// Allowed MIME types
const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];

// ⚙️ Custom storage engine (extends diskStorage with dynamic fieldname)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// ✅ Custom fileFilter to allow flexible prefixed fieldnames
const fileFilter = (req, file, cb) => {
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("❌ Invalid file type. Only PNG, JPG, JPEG, and PDF allowed."), false);
  }

  // Accept fields that start with known prefixes
  const validPrefixes = [
    "letterheadcontentheader",
    "letterheadcontentfooter",
    "documentseal",
    "documentcompany",
    "documentsignature",
    "letterheadbodycontent",
    "idcardfrontheader",
    "idcardfrontfooter",
    "idcardbackheader",
    "idcardbackfooter",
  ];

  const isValidPrefix = validPrefixes.some((prefix) => file.fieldname.startsWith(prefix));
  if (!isValidPrefix) {
    return cb(new Error(`❌ Unexpected field name: ${file.fieldname}`), false);
  }

  cb(null, true);
};

// ✅ Create upload instance
const uploadTemplate = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}).any(); // <-- important: allow all prefixed keys

module.exports = uploadTemplate;
