require('dotenv');
const AWS      = require('aws-sdk');
const multer   = require('multer');
const multerS3 = require('multer-s3');

function GetUploaderInstance(filename, validation, bucket = process.env.AWS_S3_DEFAULT_BUCKET) {
  const s3 = new AWS.S3({
    apiVersion: process.env.AWS_S3_API_VERSION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_S3_REGION,
  });

  const storage = multerS3({
    s3: s3,
    bucket,
    metadata: function (_req, file, cb) {
      cb(null, { fieldName: file.fieldname + '-' + Date.now() });
    },
    acl: 'public-read',
    key: filename || function (_req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    },
    contentType: multerS3.AUTO_CONTENT_TYPE
  });
   
  const upload = multer({
    storage: storage,
    fileFilter: validation,
    limits: {
      fileSize: process.env.AWS_MAX_FILE_SIZE, // ~5 Mb
    }
  });

  return upload;
}

module.exports = GetUploaderInstance;