const approvalService = require('../services/approval.service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

const getAllContent = async (req, res) => {
  try {
    const { status, subject, teacher_id, page, limit } = req.query;
    const result = await approvalService.getAllContent({ status, subject, teacher_id, page, limit });
    return paginatedResponse(res, result.data, result.pagination, 'Content fetched.');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to fetch content.', err.status || 500);
  }
};

const getPendingContent = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await approvalService.getPendingContent({ page, limit });
    return paginatedResponse(res, result.data, result.pagination, 'Pending content fetched.');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to fetch pending content.', err.status || 500);
  }
};

const reviewContent = async (req, res) => {
  try {
    const { action, rejection_reason } = req.body;
    const content = await approvalService.reviewContent(req.params.id, req.user.id, { action, rejection_reason });
    const message = action === 'approve' ? 'Content approved successfully.' : 'Content rejected.';
    return successResponse(res, content, message);
  } catch (err) {
    return errorResponse(res, err.message || 'Review failed.', err.status || 500);
  }
};

module.exports = { getAllContent, getPendingContent, reviewContent };
