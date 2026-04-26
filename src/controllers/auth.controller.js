const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.register({ name, email, password, role });
    return successResponse(res, result, 'Registration successful.', 201);
  } catch (err) {
    return errorResponse(res, err.message || 'Registration failed.', err.status || 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return successResponse(res, result, 'Login successful.');
  } catch (err) {
    return errorResponse(res, err.message || 'Login failed.', err.status || 500);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.id);
    return successResponse(res, user, 'Profile fetched.');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to get profile.', err.status || 500);
  }
};

module.exports = { register, login, getProfile };
