const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { upload, handleUploadError } = require('../middlewares/upload.middleware');
const { validateContentUpload } = require('../middlewares/validation.middleware');

router.post(
  '/upload',
  authenticate,
  authorize('teacher'),
  upload.single('file'),
  handleUploadError,
  validateContentUpload,
  contentController.uploadContent
);

router.get('/my', authenticate, authorize('teacher'), contentController.getMyContent);
router.get('/:id', authenticate, contentController.getContentById);

module.exports = router;
