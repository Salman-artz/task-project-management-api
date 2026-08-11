const express = require('express');
const router = express.Router();
const projectController = require('../controllers/ProjectController');
const taskController = require('../controllers/TaskController');
const activityLogController = require('../controllers/ActivityLogController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../validators/index');
const {
  updateProjectValidation,
  projectIdValidation,
} = require('../validators/project');
const {
  createTaskValidation,
  projectTaskQueryValidation,
} = require('../validators/task');

router.use(authenticate);

// GET /projects/:id — Detail project
router.get('/:id', projectIdValidation, validate, projectController.getById);

// PATCH /projects/:id — Update project
router.patch('/:id', updateProjectValidation, validate, projectController.update);

// DELETE /projects/:id — Hapus project
router.delete('/:id', projectIdValidation, validate, projectController.delete);

// GET /projects/:id/tasks — List tasks dalam project (dengan filter)
router.get('/:id/tasks', projectTaskQueryValidation, validate, taskController.list);

// POST /projects/:id/tasks — Buat task baru
router.post('/:id/tasks', createTaskValidation, validate, taskController.create);

// GET /projects/:id/activity-log — Activity logs untuk project
router.get('/:id/activity-log', projectIdValidation, validate, activityLogController.getProjectLogs);

module.exports = router;
