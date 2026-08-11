const projectService = require('../services/ProjectService');
const { success } = require('../utils/response');

class ProjectController {
  /**
   * GET /workspaces/:id/projects
   * List semua project dalam workspace
   */
  async list(req, res, next) {
    try {
      const filters = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.search) filters.search = req.query.search;

      const projects = await projectService.getWorkspaceProjects(
        req.params.id,
        req.userId,
        filters
      );
      return success(res, { projects }, 'Projects retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /projects/:id
   * Detail project
   */
  async getById(req, res, next) {
    try {
      const project = await projectService.getProjectById(req.params.id, req.userId);
      return success(res, { project }, 'Project retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /workspaces/:id/projects
   * Buat project baru dalam workspace
   */
  async create(req, res, next) {
    try {
      const project = await projectService.createProject(req.params.id, req.userId, req.body);
      return success(res, { project }, 'Project created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /projects/:id
   * Update project
   */
  async update(req, res, next) {
    try {
      const project = await projectService.updateProject(req.params.id, req.userId, req.body);
      return success(res, { project }, 'Project updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /projects/:id
   * Hapus project
   */
  async delete(req, res, next) {
    try {
      const result = await projectService.deleteProject(req.params.id, req.userId);
      return success(res, result, 'Project deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProjectController();

