const { body, param, query } = require('express-validator');

const createProjectValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Project name must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description max 1000 characters'),
];

const updateProjectValidation = [
  param('id').isUUID().withMessage('Invalid project ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Project name must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description max 1000 characters'),
  body('status')
    .optional()
    .isIn(['active', 'archived', 'completed'])
    .withMessage('Status must be active, archived, or completed'),
];

const projectIdValidation = [
  param('id').isUUID().withMessage('Invalid project ID'),
];

const workspaceProjectQueryValidation = [
  param('id').isUUID().withMessage('Invalid workspace ID'),
  query('status')
    .optional()
    .isIn(['active', 'archived', 'completed'])
    .withMessage('Status must be active, archived, or completed'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query too short'),
];

module.exports = {
  createProjectValidation,
  updateProjectValidation,
  projectIdValidation,
  workspaceProjectQueryValidation,
};
