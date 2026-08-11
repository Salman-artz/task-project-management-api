const activityLogService = require('../services/ActivityLogService');
const { success } = require('../utils/response');

class ActivityLogController {
  /**
   * GET /projects/:id/activity-log
   * Get activity log untuk project
   */
  async getProjectLogs(req, res, next) {
    try {
      const options = {
        projectId: req.params.id,
        limit: req.query.limit,
        offset: req.query.offset,
      };

      const result = await activityLogService.getWorkspaceActivityLogs(
        req.params.id,
        req.userId,
        options
      );
      return success(res, result, 'Activity logs retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /workspaces/:id/activity-log
   * Get activity log untuk seluruh workspace
   */
  async getWorkspaceLogs(req, res, next) {
    try {
      const options = {
        limit: req.query.limit,
        offset: req.query.offset,
      };

      const result = await activityLogService.getWorkspaceActivityLogs(
        req.params.id,
        req.userId,
        options
      );
      return success(res, result, 'Activity logs retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ActivityLogController();

