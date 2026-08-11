const workspaceService = require('../services/WorkspaceService');
const { success } = require('../utils/response');

class WorkspaceController {
  /**
   * GET /workspaces
   * List semua workspace milik user
   */
  async list(req, res, next) {
    try {
      const workspaces = await workspaceService.getUserWorkspaces(req.userId);
      return success(res, { workspaces }, 'Workspaces retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /workspaces/:id
   * Detail workspace
   */
  async getById(req, res, next) {
    try {
      const workspace = await workspaceService.getWorkspaceById(req.params.id, req.userId);
      return success(res, { workspace }, 'Workspace retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /workspaces
   * Buat workspace baru
   */
  async create(req, res, next) {
    try {
      const workspace = await workspaceService.createWorkspace(req.userId, req.body);
      return success(res, { workspace }, 'Workspace created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /workspaces/:id
   * Update workspace
   */
  async update(req, res, next) {
    try {
      const workspace = await workspaceService.updateWorkspace(req.params.id, req.userId, req.body);
      return success(res, { workspace }, 'Workspace updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /workspaces/:id
   * Hapus workspace
   */
  async delete(req, res, next) {
    try {
      const result = await workspaceService.deleteWorkspace(req.params.id, req.userId);
      return success(res, result, 'Workspace deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /workspaces/:id/invite
   * Invite member ke workspace
   */
  async inviteMember(req, res, next) {
    try {
      const result = await workspaceService.inviteMember(req.params.id, req.userId, req.body);
      return success(res, result, 'Member invited successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /workspaces/:id/members/:userId
   * Ubah role member
   */
  async updateMemberRole(req, res, next) {
    try {
      const result = await workspaceService.updateMemberRole(
        req.params.id,
        req.userId,
        req.params.userId,
        req.body.role
      );
      return success(res, { membership: result }, 'Member role updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /workspaces/:id/members/:userId
   * Hapus member dari workspace
   */
  async removeMember(req, res, next) {
    try {
      const result = await workspaceService.removeMember(req.params.id, req.userId, req.params.userId);
      return success(res, result, 'Member removed successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WorkspaceController();

