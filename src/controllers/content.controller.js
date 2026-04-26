const contentService = require('../services/content.service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

const uploadContent = async (req, res) => {
  try {
    const { title, description, subject, start_time, end_time, rotation_duration } = req.body;
    const content = await contentService.uploadContent({
      title, description, subject,
      file: req.file,
      teacherId: req.user.id,
      start_time, end_time, rotation_duration,
    });
    return successResponse(res, content, 'Content uploaded successfully. Awaiting principal approval.', 201);
  } catch (err) {
    console.error('Upload error:', err);
    return errorResponse(res, err.message || 'Upload failed.', err.status || 500);
  }
};

const getMyContent = async (req, res) => {
  try {
    const { status, subject, page, limit } = req.query;
    const result = await contentService.getTeacherContent(req.user.id, { status, subject, page, limit });
    return paginatedResponse(res, result.data, result.pagination, 'Content fetched.');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to fetch content.', err.status || 500);
  }
};

const getContentById = async (req, res) => {
  try {
    const content = await contentService.getContentById(req.params.id);
    if (!content) return errorResponse(res, 'Content not found.', 404);

    if (req.user.role === 'teacher' && content.uploaded_by !== req.user.id) {
      return errorResponse(res, 'Access denied.', 403);
    }
    return successResponse(res, content, 'Content fetched.');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to fetch content.', err.status || 500);
  }
};

module.exports = { uploadContent, getMyContent, getContentById };
