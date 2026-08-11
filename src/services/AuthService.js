const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const userRepository = require('../repositories/UserRepository');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');

class AuthService {
  /**
   * Register user baru
   * @param {Object} param0 - { name, email, password }
   * @returns {Object} user data (tanpa password) + tokens
   */
  async register({ name, email, password }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await userRepository.create({
      id: uuidv4(),
      name,
      email,
      password_hash: passwordHash,
    });

    const tokens = this._generateTokens(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
      },
      ...tokens,
    };
  }

  /**
   * Login user
   * @param {Object} param0 - { email, password }
   * @returns {Object} user data + tokens
   */
  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = this._generateTokens(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
      },
      ...tokens,
    };
  }

  /**
   * Refresh access token menggunakan refresh token
   * @param {string} refreshToken
   * @returns {Object} new access & refresh tokens
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      const user = await userRepository.findById(decoded.sub);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      const tokens = this._generateTokens(user);
      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  /**
   * Update profil user
   */
  async updateProfile(userId, updateData) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new BadRequestError('User not found');
    }

    const dataToUpdate = {};
    if (updateData.name) dataToUpdate.name = updateData.name;
    if (updateData.avatar_url) dataToUpdate.avatar_url = updateData.avatar_url;

    await userRepository.update(user, dataToUpdate);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
    };
  }

  /**
   * Ganti password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new BadRequestError('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await userRepository.update(user, { password_hash: passwordHash });

    return { message: 'Password changed successfully' };
  }

  /**
   * Generate JWT access & refresh tokens
   * @param {Object} user - User instance
   * @returns {Object} { accessToken, refreshToken }
   */
  _generateTokens(user) {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'refreshsecret', {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return { accessToken, refreshToken };
  }
}

module.exports = new AuthService();
