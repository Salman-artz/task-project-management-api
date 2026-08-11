const { v4: uuidv4 } = require('uuid');
const projectRepository = require('../repositories/ProjectRepository');
const workspaceRepository = require('../repositories/WorkspaceRepository');
const activityLogRepository = require('../repositories/ActivityLogRepository');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const { Op } = require('sequelize');
const { emitToWorkspace } = require('../utils/socket');

class ProjectService {
  /**
   * Get all projects in workspace
   */
  async getWorkspaceProjects(workspaceId, userId, filters = {}) {
    const membership = await workspaceRepository.findMember(workspaceId, userId);

    if (!membership) {
      throw new ForbiddenError('You are not a member of this workspace');
    }

    const whereClause = { workspace_id: workspaceId };

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.search) {
      whereClause.name = { [Op.like]: `%${filters.search}%` };
    }

    return await projectRepository.findAll(whereClause);
  }

  /**
   * Get single project with task count
   */
  async getProjectById(projectId, userId) {
    const project = await projectRepository.findById(projectId);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const membership = await workspaceRepository.findMember(project.workspace_id, userId);

    if (!membership) {
      throw new ForbiddenError('You are not a member of this workspace');
    }

    const taskCounts = await projectRepository.countTasksGroupByStatus(projectId);

    const taskStatusCounts = {};
    taskCounts.forEach((t) => {
      taskStatusCounts[t.status] = parseInt(t.dataValues.count, 10);
    });

    return {
      ...project.toJSON(),
      task_counts: {
        todo: taskStatusCounts.todo || 0,
        in_progress: taskStatusCounts.in_progress || 0,
        review: taskStatusCounts.review || 0,
        done: taskStatusCounts.done || 0,
        total: taskCounts.reduce((sum, t) => sum + parseInt(t.dataValues.count, 10), 0),
      },
      my_role: membership.role,
    };
  }

  /**
   * Create project in workspace
   */
  async createProject(workspaceId, userId, { name, description }) {
    const membership = await workspaceRepository.findMember(workspaceId, userId);

    if (!membership) {
      throw new ForbiddenError('You are not a member of this workspace');
    }

    if (membership.role === 'viewer') {
      throw new ForbiddenError('Viewers cannot create projects');
    }

    const project = await projectRepository.create({
      id: uuidv4(),
      workspace_id: workspaceId,
      name,
      description: description || null,
      created_by: userId,
    });

    await this._logActivity(workspaceId, userId, 'create_project', 'project', project.id);

    // Emit socket event
    emitToWorkspace(workspaceId, 'project:created', { project, created_by: userId });

    return project;
  }

  /**
   * Update project
   */
  async updateProject(projectId, userId, updateData) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const membership = await workspaceRepository.findMember(project.workspace_id, userId);

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new ForbiddenError('Only owner or admin can update projects');
    }

    const fieldsToUpdate = {};
    if (updateData.name) fieldsToUpdate.name = updateData.name;
    if (updateData.description !== undefined) fieldsToUpdate.description = updateData.description;
    if (updateData.status) fieldsToUpdate.status = updateData.status;

    const updatedProject = await projectRepository.update(project, fieldsToUpdate);

    await this._logActivity(project.workspace_id, userId, 'update_project', 'project', project.id);

    // Emit socket event
    emitToWorkspace(project.workspace_id, 'project:updated', { project: updatedProject, updated_by: userId });

    return updatedProject;
  }

  /**
   * Delete project
   */
  async deleteProject(projectId, userId) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const membership = await workspaceRepository.findMember(project.workspace_id, userId);

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new ForbiddenError('Only owner or admin can delete projects');
    }

    const workspaceId = project.workspace_id;
    await this._logActivity(workspaceId, userId, 'delete_project', 'project', project.id);

    await projectRepository.delete(project);

    // Emit socket event
    emitToWorkspace(workspaceId, 'project:deleted', { projectId, deleted_by: userId });

    return { message: 'Project deleted successfully' };
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

module.exports = new ProjectService();
