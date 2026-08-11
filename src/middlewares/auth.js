const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/errors');
const db = require('../database/models');

/**
 * Middleware untuk memverifikasi JWT access token
 * Menambahkan user info ke req.user jika valid
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token required');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verifikasi user masih ada di database
    const user = await db.User.findByPk(decoded.sub, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token expired'));
    }
    next(error);
  }
};

/**
 * Middleware untuk mengecek role dalam workspace
 * Harus dipanggil setelah authenticate dan setelah req.params memiliki workspaceId
 * @param {string[]} allowedRoles - Array of roles yang diizinkan
 */
const authorizeWorkspaceRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const workspaceId = req.params.workspaceId || req.params.id;
      const userId = req.userId;

      // Cari membership user di workspace
      const membership = await db.WorkspaceMember.findOne({
        where: {
          workspace_id: workspaceId,
          user_id: userId,
        },
      });

      if (!membership) {
        return next(new (require('../utils/errors').ForbiddenError)('You are not a member of this workspace'));
      }

      if (!allowedRoles.includes(membership.role)) {
        return next(new (require('../utils/errors').ForbiddenError)(`Required role: ${allowedRoles.join(', ')}`));
      }

      req.membership = membership;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { authenticate, authorizeWorkspaceRole };

