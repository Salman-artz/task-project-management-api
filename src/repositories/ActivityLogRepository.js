const db = require('../database/models');

class ActivityLogRepository {
  async create(logData) {
    return await db.ActivityLog.create(logData);
  }

  async findWorkspaceLogs(whereClause, limit, offset) {
    const logs = await db.ActivityLog.findAll({
      where: whereClause,
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'avatar_url'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    const total = await db.ActivityLog.count({ where: whereClause });

    return { logs, total };
  }
}

module.exports = new ActivityLogRepository();
