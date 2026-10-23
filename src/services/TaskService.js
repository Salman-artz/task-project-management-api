const { v4: uuidv4 } = require('uuid');
const taskRepository = require('../repositories/TaskRepository');
const projectRepository = require('../repositories/ProjectRepository');
const workspaceRepository = require('../repositories/WorkspaceRepository');
const activityLogRepository = require('../repositories/ActivityLogRepository');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const { Op } = require('sequelize');
const { emitToWorkspace, emitToTask } = require('../utils/socket');

class TaskService {
  /**
   * Get tasks for a project with filters
   */
  async getProjectTasks(projectId, userId, filters = {}) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const membership = await workspaceRepository.findMember(project.workspace_id, userId);

    if (!membership) {
      throw new ForbiddenError('You are not a member of this workspace');
    }

    const whereClause = { project_id: projectId };

    if (filters.status) whereClause.status = filters.status;
    if (filters.priority) whereClause.priority = filters.priority;

    if (filters.assignee) {
      const assignedTaskIds = await taskRepository.findAssignedTaskIds(filters.assignee);
      whereClause.id = { [Op.in]: assignedTaskIds };
    }

    if (filters.due_date_from && filters.due_date_to) {
      whereClause.due_date = {
        [Op.between]: [new Date(filters.due_date_from), new Date(filters.due_date_to)],
      };
    } else if (filters.due_date_from) {
      whereClause.due_date = { [Op.gte]: new Date(filters.due_date_from) };
    } else if (filters.due_date_to) {
      whereClause.due_date = { [Op.lte]: new Date(filters.due_date_to) };
    }

    if (filters.search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${filters.search}%` } },
        { description: { [Op.like]: `%${filters.search}%` } },
      ];
    }

    return await taskRepository.findAll(whereClause);
  }

  /**
   * Get single task with details
   */
  async getTaskById(taskId, userId) {
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const membership = await workspaceRepository.findMember(task.project.workspace_id, userId);

    if (!membership) {
      throw new ForbiddenError('You are not a member of this workspace');
    }

    return task;
  }

  /**
   * Create task in project
   */
  async createTask(projectId, userId, taskData) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const membership = await workspaceRepository.findMember(project.workspace_id, userId);

    if (!membership || membership.role === 'viewer') {
      throw new ForbiddenError('Viewers cannot create tasks');
    }

    const task = await taskRepository.create({
      id: uuidv4(),
      project_id: projectId,
      title: taskData.title,
      description: taskData.description || null,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      due_date: taskData.due_date || null,
      created_by: userId,
    });

    await this._logActivity(project.workspace_id, userId, 'create_task', 'task', task.id);

    const createdTask = await this.getTaskById(task.id, userId);

    // Emit socket event
    emitToWorkspace(project.workspace_id, 'task:created', { task: createdTask, created_by: userId });

    return createdTask;
  }

  /**
   * Update task
   */
  async updateTask(taskId, userId, updateData) {
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const membership = await workspaceRepository.findMember(task.project.workspace_id, userId);

    if (!membership || membership.role === 'viewer') {
      throw new ForbiddenError('Viewers cannot update tasks');
    }

    if (membership.role === 'member') {
      const isAssigned = await taskRepository.findAssignee(taskId, userId);
      if (!isAssigned) {
        throw new ForbiddenError('You can only update tasks assigned to you');
      }
    }

    const fieldsToUpdate = {};
    ['title', 'description', 'status', 'priority', 'due_date'].forEach((field) => {
      if (updateData[field] !== undefined) {
        fieldsToUpdate[field] = updateData[field];
      }
    });

    await taskRepository.update(task, fieldsToUpdate);

    await this._logActivity(task.project.workspace_id, userId, 'update_task', 'task', taskId);

    const updatedTask = await this.getTaskById(taskId, userId);

    // Emit socket event for real-time updates
    emitToWorkspace(task.project.workspace_id, 'task:updated', { task: updatedTask, updated_by: userId });
    emitToTask(taskId, 'task:updated', { task: updatedTask, updated_by: userId });

    return updatedTask;
  }

  /**
   * Delete task
   */
  async deleteTask(taskId, userId) {
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const membership = await workspaceRepository.findMember(task.project.workspace_id, userId);

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new ForbiddenError('Only owner or admin can delete tasks');
    }

    const workspaceId = task.project.workspace_id;
    await this._logActivity(workspaceId, userId, 'delete_task', 'task', taskId);

    await taskRepository.delete(task);

    // Emit socket event
    emitToWorkspace(workspaceId, 'task:deleted', { taskId, deleted_by: userId });

    return { message: 'Task deleted successfully' };
  }

  /**
   * Assign users to task
   */
  async assignUsers(taskId, userId, userIds) {
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const membership = await workspaceRepository.findMember(task.project.workspace_id, userId);

    if (!membership || membership.role === 'viewer') {
      throw new ForbiddenError('Viewers cannot assign users');
    }

    const newAssignees = userIds.map((uid) => ({
      id: uuidv4(),
      task_id: taskId,
      user_id: uid,
    }));

    await taskRepository.setAssignees(taskId, newAssignees);

    await this._logActivity(task.project.workspace_id, userId, 'assign_task', 'task', taskId);

    const updatedTask = await this.getTaskById(taskId, userId);

    // Emit socket event
    emitToWorkspace(task.project.workspace_id, 'task:assigned', { task: updatedTask, assigned_by: userId, userIds });
    emitToTask(taskId, 'task:assigned', { task: updatedTask, assigned_by: userId, userIds });

    return updatedTask;
  }

  /**
   * Add comment to task
   */
  async addComment(taskId, userId, content) {
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const membership = await workspaceRepository.findMember(task.project.workspace_id, userId);

    if (!membership) {
      throw new ForbiddenError('You are not a member of this workspace');
    }

    const commentWithUser = await taskRepository.addComment({
      id: uuidv4(),
      task_id: taskId,
      user_id: userId,
      content,
    });

    await this._logActivity(task.project.workspace_id, userId, 'comment_task', 'task', taskId);

    // Emit socket event
    emitToTask(taskId, 'comment:added', { comment: commentWithUser, taskId });
    if (task.project && task.project.workspace_id) {
      emitToWorkspace(task.project.workspace_id, 'comment:added', {
        comment: commentWithUser,
        taskId,
        taskTitle: task.title,
        projectId: task.project_id,
        workspaceId: task.project.workspace_id,
      });
    }

    return commentWithUser;
  }

  /**
   * Add attachment to task
   */
  async addAttachment(taskId, userId, attachmentData) {
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const membership = await workspaceRepository.findMember(task.project.workspace_id, userId);

    if (!membership || membership.role === 'viewer') {
      throw new ForbiddenError('Viewers cannot add attachments');
    }

    const attachmentWithUser = await taskRepository.addAttachment({
      id: uuidv4(),
      task_id: taskId,
      file_url: attachmentData.file_url,
      file_name: attachmentData.file_name,
      file_size: attachmentData.file_size,
      mime_type: attachmentData.mime_type,
      uploaded_by: userId,
    });

    // Emit socket event
    emitToTask(taskId, 'attachment:added', { attachment: attachmentWithUser, taskId });

    return attachmentWithUser;
  }

  /**
   * Remove attachment
   */
  async removeAttachment(taskId, attachmentId, userId) {
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const membership = await workspaceRepository.findMember(task.project.workspace_id, userId);

    if (!membership || membership.role === 'viewer') {
      throw new ForbiddenError('Viewers cannot remove attachments');
    }

    const deleted = await taskRepository.removeAttachment(attachmentId);
    
    if (!deleted) {
      throw new NotFoundError('Attachment not found');
    }

    // Emit socket event
    emitToTask(taskId, 'attachment:removed', { attachmentId, taskId });

    return { message: 'Attachment removed successfully' };
  }

  /**
   * Log activity
   */
  async _logActivity(workspaceId, userId, action, entityType, entityId) {
    await activityLogRepository.create({
      id: uuidv4(),
      workspace_id: workspaceId,
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
    });
  }
}

module.exports = new TaskService();
