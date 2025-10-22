const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Create folder inside /EmployeeUserDocuments
// const createFolder = (folder) => {
//   const dir = path.join(__dirname, '../EmployeeUserDocuments', folder);
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//   }
//   return dir;
// };

const uploadDir = path.join(__dirname, '../EmployeeUserDocuments');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const getMulterMiddleware = (folder = 'default') => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  });

  return multer({ storage }).array('files', 10); // handles only `files` field
};

module.exports = { getMulterMiddleware };
