const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const { authenticate } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const { validate } = require('../validators/index');
const {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  updateProfileValidation,
  changePasswordValidation,
} = require('../validators/auth');

// POST /auth/register
router.post('/register', registerValidation, validate, authController.register);

// POST /auth/login
router.post('/login', loginValidation, validate, authController.login);

// POST /auth/refresh-token
router.post('/refresh-token', refreshTokenValidation, validate, authController.refreshToken);

// GET /auth/me — butuh autentikasi
router.get('/me', authenticate, authController.getProfile);

// PATCH /auth/me — update profil
router.patch('/me', authenticate, upload.single('avatar'), updateProfileValidation, validate, authController.updateProfile);

// POST /auth/change-password
router.post('/change-password', authenticate, changePasswordValidation, validate, authController.changePassword);

module.exports = router;

