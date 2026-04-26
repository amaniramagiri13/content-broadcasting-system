const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approval.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validateApproval } = require('../middlewares/validation.middleware');

router.get('/content', authenticate, authorize('principal'), approvalController.getAllContent);
router.get('/pending', authenticate, authorize('principal'), approvalController.getPendingContent);
router.patch(
  '/content/:id/review',
  authenticate,
  authorize('principal'),
  validateApproval,
  approvalController.reviewContent
);

module.exports = router;
