import multer from 'multer';

/**
 * Multer storage: using memory storage to keep files in buffer
 * This is useful when uploading directly to services like Cloudinary without saving locally.
 */
const storage = multer.memoryStorage();

/**
 * File filter to allow only image files.
 * @param {Request} req
 * @param {File} file
 * @param {Function} cb
 */
function imageFileFilter(req, file, cb) {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(file.mimetype);
  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images are allowed (jpeg, jpg, png, gif)'));
  }
}

/**
 * Multer upload middleware with:
 * - memory storage
 * - file size limit 5MB
 * - image file filter
 */
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: imageFileFilter,
});

export default upload;
