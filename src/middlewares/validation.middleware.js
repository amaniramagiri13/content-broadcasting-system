const { errorResponse } = require('../utils/response');

const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters.');
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required.');
  }
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters.');
  }
  if (!role || !['principal', 'teacher'].includes(role)) {
    errors.push('Role must be either "principal" or "teacher".');
  }

  if (errors.length > 0) {
    return errorResponse(res, 'Validation failed', 400, errors);
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push('Email is required.');
  if (!password) errors.push('Password is required.');

  if (errors.length > 0) {
    return errorResponse(res, 'Validation failed', 400, errors);
  }
  next();
};

const validateContentUpload = (req, res, next) => {
  const { title, subject, start_time, end_time, rotation_duration } = req.body;
  const errors = [];

  if (!title || title.trim().length < 1) {
    errors.push('Title is required.');
  }
  if (!subject || subject.trim().length < 1) {
    errors.push('Subject is required.');
  }
  if (!req.file) {
    errors.push('File is required.');
  }
  if (start_time && isNaN(Date.parse(start_time))) {
    errors.push('start_time must be a valid ISO date string.');
  }
  if (end_time && isNaN(Date.parse(end_time))) {
    errors.push('end_time must be a valid ISO date string.');
  }
  if (start_time && end_time && new Date(start_time) >= new Date(end_time)) {
    errors.push('start_time must be before end_time.');
  }
  if (rotation_duration !== undefined && (isNaN(rotation_duration) || parseInt(rotation_duration) < 1)) {
    errors.push('rotation_duration must be a positive integer (minutes).');
  }

  if (errors.length > 0) {
    return errorResponse(res, 'Validation failed', 400, errors);
  }
  next();
};

const validateApproval = (req, res, next) => {
  const { action, rejection_reason } = req.body;
  const errors = [];

  if (!action || !['approve', 'reject'].includes(action)) {
    errors.push('Action must be "approve" or "reject".');
  }
  if (action === 'reject' && (!rejection_reason || rejection_reason.trim().length < 1)) {
    errors.push('Rejection reason is required when rejecting content.');
  }

  if (errors.length > 0) {
    return errorResponse(res, 'Validation failed', 400, errors);
  }
  next();
};

module.exports = { validateRegister, validateLogin, validateContentUpload, validateApproval };
