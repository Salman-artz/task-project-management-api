const activityLogRepository = require('../repositories/ActivityLogRepository');
const workspaceRepository = require('../repositories/WorkspaceRepository');
const { ForbiddenError } = require('../utils/errors');
const db = require('../database/models');

class ActivityLogService {
  /**
   * Get activity logs for a workspace
   */
  async getWorkspaceActivityLogs(workspaceId, userId, options = {}) {
    const membership = await workspaceRepository.findMember(workspaceId, userId);

    if (!membership) {
      throw new ForbiddenError('You are not a member of this workspace');
    }

    const whereClause = { workspace_id: workspaceId };

    if (options.projectId) {
      const projectTasks = await db.Task.findAll({
        where: { project_id: options.projectId },
        attributes: ['id'],
      });
      const taskIds = projectTasks.map((t) => t.id);

      whereClause[db.Sequelize.Op.or] = [
        { entity_type: 'project', entity_id: options.projectId },
        { entity_type: 'task', entity_id: { [db.Sequelize.Op.in]: taskIds } },
      ];
    }

    if (options.taskId) {
      whereClause.entity_type = 'task';
      whereClause.entity_id = options.taskId;
    }

    const limit = parseInt(options.limit, 10) || 50;
    const offset = parseInt(options.offset, 10) || 0;

    const { logs, total } = await activityLogRepository.findWorkspaceLogs(whereClause, limit, offset);

    return {
      logs,
      pagination: {
        total,
        limit,
        offset,
      },
    };
  }
}

module.exports = new ActivityLogService();
