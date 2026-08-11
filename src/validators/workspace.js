const { body, param } = require('express-validator');

const createWorkspaceValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Workspace name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Workspace name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description max 500 characters'),
];

const updateWorkspaceValidation = [
  param('id').isUUID().withMessage('Invalid workspace ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Workspace name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description max 500 characters'),
];

const inviteMemberValidation = [
  param('id').isUUID().withMessage('Invalid workspace ID'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  body('role')
    .optional()
    .isIn(['admin', 'member', 'viewer'])
    .withMessage('Role must be admin, member, or viewer'),
];

const updateMemberRoleValidation = [
  param('id').isUUID().withMessage('Invalid workspace ID'),
  param('userId').isUUID().withMessage('Invalid user ID'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'member', 'viewer'])
    .withMessage('Role must be admin, member, or viewer'),
];

const removeMemberValidation = [
  param('id').isUUID().withMessage('Invalid workspace ID'),
  param('userId').isUUID().withMessage('Invalid user ID'),
];

const workspaceIdValidation = [
  param('id').isUUID().withMessage('Invalid workspace ID'),
];

module.exports = {
  createWorkspaceValidation,
  updateWorkspaceValidation,
  inviteMemberValidation,
  updateMemberRoleValidation,
  removeMemberValidation,
  workspaceIdValidation,
};
