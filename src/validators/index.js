const { validationResult } = require('express-validator');
const { BadRequestError } = require('../utils/errors');

/**
 * Middleware untuk memeriksa hasil validasi
 * Dipanggil setelah validator rules
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }
  next();
};

module.exports = { validate };

