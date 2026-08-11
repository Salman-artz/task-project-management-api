const db = require('../database/models');

class TaskRepository {
  async findAll(whereClause) {
    return await db.Task.findAll({
      where: whereClause,
      include: [
        {
          model: db.User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'avatar_url'],
        },
        {
          model: db.User,
          as: 'assignees',
          attributes: ['id', 'name', 'email', 'avatar_url'],
          through: { attributes: [] },
        },
      ],
      order: [
        [db.sequelize.literal("FIELD(priority, 'high', 'medium', 'low')")],
        ['created_at', 'DESC'],
      ],
    });
  }

  async findAssignedTaskIds(userId) {
    const assignedTasks = await db.TaskAssignee.findAll({
      where: { user_id: userId },
      attributes: ['task_id'],
    });
    return assignedTasks.map((a) => a.task_id);
  }

  async findById(taskId) {
    return await db.Task.findByPk(taskId, {
      include: [
        {
          model: db.Project,
          as: 'project',
          attributes: ['id', 'name', 'workspace_id'],
        },
        {
          model: db.User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'avatar_url'],
        },
        {
          model: db.User,
          as: 'assignees',
          attributes: ['id', 'name', 'email', 'avatar_url'],
          through: { attributes: [] },
        },
        {
          model: db.Comment,
          as: 'comments',
          include: [
            {
              model: db.User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'avatar_url'],
            },
          ],
          order: [['created_at', 'ASC']],
        },
        {
          model: db.Attachment,
          as: 'attachments',
          include: [
            {
              model: db.User,
              as: 'uploader',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    });
  }

  async findAssignee(taskId, userId) {
    return await db.TaskAssignee.findOne({
      where: { task_id: taskId, user_id: userId },
    });
  }

  async create(taskData) {
    return await db.Task.create(taskData);
  }

  async update(task, updateData) {
    Object.assign(task, updateData);
    return await task.save();
  }

  async delete(task) {
    return await task.destroy();
  }

  async setAssignees(taskId, assigneeRecords) {
    return await db.sequelize.transaction(async (t) => {
      await db.TaskAssignee.destroy({ where: { task_id: taskId }, transaction: t });
      return await db.TaskAssignee.bulkCreate(assigneeRecords, { transaction: t });
    });
  }

  async addComment(commentData) {
    const comment = await db.Comment.create(commentData);
    return await db.Comment.findByPk(comment.id, {
      include: [
        { model: db.User, as: 'user', attributes: ['id', 'name', 'email', 'avatar_url'] },
      ],
    });
  }

  async addAttachment(attachmentData) {
    const attachment = await db.Attachment.create(attachmentData);
    return await db.Attachment.findByPk(attachment.id, {
      include: [
        { model: db.User, as: 'uploader', attributes: ['id', 'name'] },
      ],
    });
  }

  async removeAttachment(attachmentId) {
    const deletedCount = await db.Attachment.destroy({
      where: { id: attachmentId }
    });
    return deletedCount > 0;
  }
}

module.exports = new TaskRepository();
