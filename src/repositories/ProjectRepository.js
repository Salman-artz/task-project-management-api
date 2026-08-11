const db = require('../database/models');

class ProjectRepository {
  async findAll(whereClause) {
    return await db.Project.findAll({
      where: whereClause,
      include: [
        {
          model: db.User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'avatar_url'],
        },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  async findById(projectId) {
    return await db.Project.findByPk(projectId, {
      include: [
        {
          model: db.User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'avatar_url'],
        },
        {
          model: db.Workspace,
          as: 'workspace',
          attributes: ['id', 'name'],
        },
      ],
    });
  }

  async countTasksGroupByStatus(projectId) {
    return await db.Task.findAll({
      where: { project_id: projectId },
      attributes: ['status', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']],
      group: ['status'],
    });
  }

  async create(projectData) {
    return await db.Project.create(projectData);
  }

  async update(project, updateData) {
    Object.assign(project, updateData);
    return await project.save();
  }

  async delete(project) {
    return await project.destroy();
  }
}

module.exports = new ProjectRepository();
