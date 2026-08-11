const taskService = require('../services/TaskService');
const { success } = require('../utils/response');
const { processFileUpload } = require('../middlewares/upload');
const { BadRequestError } = require('../utils/errors');

class TaskController {
  /**
   * GET /projects/:id/tasks
   * List tasks dalam project dengan filter
   */
  async list(req, res, next) {
    try {
      const filters = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.priority) filters.priority = req.query.priority;
      if (req.query.assignee) filters.assignee = req.query.assignee;
      if (req.query.due_date_from) filters.due_date_from = req.query.due_date_from;
      if (req.query.due_date_to) filters.due_date_to = req.query.due_date_to;
      if (req.query.search) filters.search = req.query.search;

      const tasks = await taskService.getProjectTasks(req.params.id, req.userId, filters);
      return success(res, { tasks }, 'Tasks retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /tasks/:id
   * Detail task
   */
  async getById(req, res, next) {
    try {
      const task = await taskService.getTaskById(req.params.id, req.userId);
      return success(res, { task }, 'Task retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /projects/:id/tasks
   * Buat task baru dalam project
   */
  async create(req, res, next) {
    try {
      const task = await taskService.createTask(req.params.id, req.userId, req.body);
      return success(res, { task }, 'Task created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /tasks/:id
   * Update task
   */
  async update(req, res, next) {
    try {
      const task = await taskService.updateTask(req.params.id, req.userId, req.body);
      return success(res, { task }, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /tasks/:id
   * Hapus task
   */
  async delete(req, res, next) {
    try {
      const result = await taskService.deleteTask(req.params.id, req.userId);
      return success(res, result, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /tasks/:id/assignees
   * Assign users ke task
   */
  async assignUsers(req, res, next) {
    try {
      const task = await taskService.assignUsers(req.params.id, req.userId, req.body.userIds);
      return success(res, { task }, 'Users assigned successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /tasks/:id/comments
   * Tambah komentar ke task
   */
  async addComment(req, res, next) {
    try {
      const comment = await taskService.addComment(req.params.id, req.userId, req.body.content);
      return success(res, { comment }, 'Comment added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /tasks/:id/attachments
   * Tambah attachment ke task (mendukung file upload via multipart/form-data atau JSON file_url)
   */
  async addAttachment(req, res, next) {
    try {
      let fileUrl = req.body?.file_url;
      let fileName = req.body?.file_name || null;
      let fileSize = req.body?.file_size || null;
      let mimeType = req.body?.mime_type || null;

      if (req.file) {
        fileUrl = await processFileUpload(req.file);
        fileName = req.file.originalname;
        fileSize = req.file.size;
        mimeType = req.file.mimetype;
      }

      if (!fileUrl) {
        throw new BadRequestError('File upload or file_url is required');
      }

      const attachmentData = {
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        mime_type: mimeType
      };

      const attachment = await taskService.addAttachment(
        req.params.id,
        req.userId,
        attachmentData
      );
      return success(res, { attachment }, 'Attachment added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /tasks/:id/attachments/:attachmentId
   * Hapus attachment
   */
  async removeAttachment(req, res, next) {
    try {
      const result = await taskService.removeAttachment(req.params.id, req.params.attachmentId, req.userId);
      return success(res, result, 'Attachment removed successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
