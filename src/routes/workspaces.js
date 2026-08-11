const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/WorkspaceController');
const projectController = require('../controllers/ProjectController');
const activityLogController = require('../controllers/ActivityLogController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../validators/index');
const {
  createWorkspaceValidation,
  updateWorkspaceValidation,
  inviteMemberValidation,
  updateMemberRoleValidation,
  removeMemberValidation,
  workspaceIdValidation,
} = require('../validators/workspace');
const {
  createProjectValidation,
  workspaceProjectQueryValidation,
} = require('../validators/project');

// Semua route butuh autentikasi
router.use(authenticate);

// GET /workspaces — List semua workspace
router.get('/', workspaceController.list);

// POST /workspaces — Buat workspace baru
router.post('/', createWorkspaceValidation, validate, workspaceController.create);

// GET /workspaces/:id — Detail workspace
router.get('/:id', workspaceIdValidation, validate, workspaceController.getById);

// PATCH /workspaces/:id — Update workspace
router.patch('/:id', updateWorkspaceValidation, validate, workspaceController.update);

// DELETE /workspaces/:id — Hapus workspace
router.delete('/:id', workspaceIdValidation, validate, workspaceController.delete);

// POST /workspaces/:id/invite — Invite member
router.post('/:id/invite', inviteMemberValidation, validate, workspaceController.inviteMember);

// PATCH /workspaces/:id/members/:userId — Ubah role member
router.patch('/:id/members/:userId', updateMemberRoleValidation, validate, workspaceController.updateMemberRole);

// DELETE /workspaces/:id/members/:userId — Hapus member
router.delete('/:id/members/:userId', removeMemberValidation, validate, workspaceController.removeMember);

// GET /workspaces/:id/projects — List projects dalam workspace
router.get('/:id/projects', workspaceProjectQueryValidation, validate, projectController.list);

// POST /workspaces/:id/projects — Buat project dalam workspace
router.post('/:id/projects', createProjectValidation, validate, projectController.create);

// GET /workspaces/:id/activity-log — Activity logs workspace
router.get('/:id/activity-log', workspaceIdValidation, validate, activityLogController.getWorkspaceLogs);

module.exports = router;
