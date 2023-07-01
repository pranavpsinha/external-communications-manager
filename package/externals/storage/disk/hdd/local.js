require('dotenv');
const multer = require('multer');

function GetUploaderInstance(filename, validation, path = process.env.FS_LOCAL_TEMP_DIR) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path)
    },
    filename: filename || function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  });
   
  const upload = multer({
    storage: storage,
    fileFilter: validation,
    limits: {
      fileSize: process.env.FS_MAX_FILE_SIZE, // ~5 Mb
    }
  });

  return upload;
}

module.exports = GetUploaderInstance;