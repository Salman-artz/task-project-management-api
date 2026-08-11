const authService = require('../services/AuthService');
const { success } = require('../utils/response');
const { AppError } = require('../utils/errors');
const { processFileUpload } = require('../middlewares/upload');

class AuthController {
  /**
   * POST /auth/register
   * Registrasi user baru
   */
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return success(res, result, 'Registration successful', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/login
   * Login user
   */
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/refresh-token
   * Refresh access token
   */
  async refreshToken(req, res, next) {
    try {
      const result = await authService.refreshToken(req.body.refreshToken);
      return success(res, result, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /auth/me
   * Mendapatkan profil user yang sedang login
   */
  async getProfile(req, res, next) {
    try {
      return success(res, { user: req.user }, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /auth/me
   * Update profil user
   */
  async updateProfile(req, res, next) {
    try {
      let avatar_url = req.body.avatar_url;
      if (req.file) {
        avatar_url = await processFileUpload(req.file);
      }
      
      const updateData = { ...req.body };
      if (avatar_url) {
        updateData.avatar_url = avatar_url;
      }
      
      const user = await authService.updateProfile(req.userId, updateData);
      return success(res, { user }, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/change-password
   * Ganti password
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.userId, currentPassword, newPassword);
      return success(res, result, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

