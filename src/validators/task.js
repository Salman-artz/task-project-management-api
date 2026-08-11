const { body, param, query } = require('express-validator');

const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 2, max: 300 })
    .withMessage('Title must be between 2 and 300 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description max 2000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'review', 'done'])
    .withMessage('Status must be: todo, in_progress, review, or done'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be: low, medium, or high'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
];

const updateTaskValidation = [
  param('id').isUUID().withMessage('Invalid task ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 300 })
    .withMessage('Title must be between 2 and 300 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description max 2000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'review', 'done'])
    .withMessage('Status must be: todo, in_progress, review, or done'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be: low, medium, or high'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
];

const taskIdValidation = [
  param('id').isUUID().withMessage('Invalid task ID'),
];

const projectTaskQueryValidation = [
  param('id').isUUID().withMessage('Invalid project ID'),
  query('status')
    .optional()
    .isIn(['todo', 'in_progress', 'review', 'done'])
    .withMessage('Status must be: todo, in_progress, review, or done'),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be: low, medium, or high'),
  query('assignee')
    .optional()
    .isUUID()
    .withMessage('Assignee must be a valid UUID'),
  query('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query too short'),
];

const assignTaskValidation = [
  param('id').isUUID().withMessage('Invalid task ID'),
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('userIds must be an array with at least one user ID'),
  body('userIds.*')
    .isUUID()
    .withMessage('Each user ID must be a valid UUID'),
];

const commentValidation = [
  param('id').isUUID().withMessage('Invalid task ID'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment must be between 1 and 2000 characters'),
];

module.exports = {
  createTaskValidation,
  updateTaskValidation,
  taskIdValidation,
  projectTaskQueryValidation,
  assignTaskValidation,
  commentValidation,
};
