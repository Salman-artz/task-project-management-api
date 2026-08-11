const express = require('express');
const router = express.Router();
const taskController = require('../controllers/TaskController');
const { authenticate } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const { validate } = require('../validators/index');
const {
  updateTaskValidation,
  taskIdValidation,
  assignTaskValidation,
  commentValidation,
} = require('../validators/task');

router.use(authenticate);

// GET /tasks/:id — Detail task
router.get('/:id', taskIdValidation, validate, taskController.getById);

// PATCH /tasks/:id — Update task
router.patch('/:id', updateTaskValidation, validate, taskController.update);

// DELETE /tasks/:id — Hapus task
router.delete('/:id', taskIdValidation, validate, taskController.delete);

// POST /tasks/:id/assignees — Assign users
router.post('/:id/assignees', assignTaskValidation, validate, taskController.assignUsers);

// POST /tasks/:id/comments — Tambah komentar
router.post('/:id/comments', commentValidation, validate, taskController.addComment);

// POST /tasks/:id/attachments — Tambah attachment (support multipart file upload & JSON body)
router.post('/:id/attachments', taskIdValidation, validate, upload.single('file'), taskController.addAttachment);

// DELETE /tasks/:id/attachments/:attachmentId — Hapus attachment
router.delete('/:id/attachments/:attachmentId', taskIdValidation, validate, taskController.removeAttachment);

module.exports = router;
